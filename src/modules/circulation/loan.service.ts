import { prisma } from '../../config/prisma.ts';
import { env } from '../../config/env.ts';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/AppError.ts';
import { parsePagination, toPageResponse } from '../../common/pagination.ts';
import { CheckoutInput } from './loan.schema.ts';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(earlyDateStr: string, lateDateStr: string): number {
  const d1 = new Date(earlyDateStr);
  const d2 = new Date(lateDateStr);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export class LoanService {
  static async checkout(data: CheckoutInput, librarianId: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Validate copy exists and is AVAILABLE
      const copy = await tx.bookCopy.findUnique({
        where: { id: data.bookCopyId },
        include: { book: true },
      });

      if (!copy) {
        throw new NotFoundError(`Book copy with id ${data.bookCopyId} not found`);
      }

      if (copy.status !== 'AVAILABLE') {
        throw new ConflictError(
          `Copy ${copy.copyCode} is not available (status=${copy.status})`,
          'COPY_NOT_AVAILABLE'
        );
      }

      // 2. Validate member exists, is ACTIVE, and under fine threshold
      const member = await tx.user.findUnique({
        where: { id: data.memberId },
      });

      if (!member) {
        throw new NotFoundError(`Member with id ${data.memberId} not found`);
      }

      if (member.status !== 'ACTIVE') {
        throw new ForbiddenError(
          `Member ${member.fullName} is ${member.status.toLowerCase()} and cannot borrow books`,
          'MEMBER_BLOCKED'
        );
      }

      // Calculate unpaid fines
      const unpaidFines = await tx.fine.findMany({
        where: {
          memberId: member.id,
          status: 'UNPAID',
        },
      });

      const totalUnpaidFines = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
      if (totalUnpaidFines >= env.FINE_MAX_UNPAID_BEFORE_BLOCK) {
        throw new ForbiddenError(
          `Member has unpaid fines (${totalUnpaidFines.toLocaleString()} VND) exceeding block threshold (${env.FINE_MAX_UNPAID_BEFORE_BLOCK.toLocaleString()} VND)`,
          'MEMBER_BLOCKED'
        );
      }

      // 3. Create Loan
      const today = new Date();
      const loanDate = formatDate(today);
      const dueDate = formatDate(addDays(today, env.LOAN_DEFAULT_PERIOD_DAYS));

      const loan = await tx.loan.create({
        data: {
          bookCopyId: copy.id,
          memberId: member.id,
          librarianId,
          loanDate,
          dueDate,
          status: 'ONGOING',
          renewalCount: 0,
        },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
          member: true,
        },
      });

      // 4. Update copy to BORROWED
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'BORROWED' },
      });

      return {
        id: loan.id,
        bookCopy: {
          id: loan.bookCopy.id,
          copyCode: loan.bookCopy.copyCode,
          book: {
            id: loan.bookCopy.book.id,
            title: loan.bookCopy.book.title,
          },
        },
        member: {
          id: loan.member.id,
          fullName: loan.member.fullName,
        },
        librarianId: loan.librarianId,
        loanDate: loan.loanDate,
        dueDate: loan.dueDate,
        status: loan.status,
        renewalCount: loan.renewalCount,
      };
    });
  }

  static async returnLoan(loanId: number) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
          member: true,
        },
      });

      if (!loan) {
        throw new NotFoundError(`Loan with id ${loanId} not found`);
      }

      if (loan.status === 'RETURNED') {
        throw new ConflictError('Loan is already returned', 'LOAN_ALREADY_RETURNED');
      }

      const today = new Date();
      const returnDate = formatDate(today);
      let fineGenerated = null;

      // Check if late
      if (returnDate > loan.dueDate) {
        const daysLate = daysBetween(loan.dueDate, returnDate);
        if (daysLate > 0) {
          const fineAmount = daysLate * env.FINE_DAILY_RATE;
          const fine = await tx.fine.create({
            data: {
              loanId: loan.id,
              memberId: loan.memberId,
              amount: fineAmount,
              reason: 'LATE_RETURN',
              status: 'UNPAID',
              issuedDate: returnDate,
            },
          });

          // Also create a notification for the member
          await tx.notification.create({
            data: {
              userId: loan.memberId,
              type: 'FINE_ISSUED',
              message: `A fine of ${fineAmount.toLocaleString()} VND was issued for late return of "${loan.bookCopy.book.title}".`,
            },
          });

          fineGenerated = {
            id: fine.id,
            amount: fine.amount.toFixed(2),
            reason: fine.reason,
          };
        }
      }

      // Check for waiting reservations on this book (Phase 4 integration)
      const waitingReservation = await tx.reservation.findFirst({
        where: {
          bookId: loan.bookCopy.bookId,
          status: 'PENDING',
        },
        orderBy: {
          queuePosition: 'asc',
        },
      });

      if (waitingReservation) {
        // Earmark copy as RESERVED
        await tx.bookCopy.update({
          where: { id: loan.bookCopyId },
          data: { status: 'RESERVED' },
        });

        // Set reservation to READY with pickup window
        const expiryDate = formatDate(addDays(today, env.RESERVATION_PICKUP_WINDOW_DAYS));
        await tx.reservation.update({
          where: { id: waitingReservation.id },
          data: {
            status: 'READY',
            expiryDate,
          },
        });

        // Notify member
        await tx.notification.create({
          data: {
            userId: waitingReservation.memberId,
            type: 'RESERVATION_READY',
            message: `Your reservation for "${loan.bookCopy.book.title}" is ready for pickup until ${expiryDate}!`,
          },
        });
      } else {
        // Set copy as AVAILABLE
        await tx.bookCopy.update({
          where: { id: loan.bookCopyId },
          data: { status: 'AVAILABLE' },
        });
      }

      // Update loan to RETURNED
      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: {
          returnDate,
          status: 'RETURNED',
        },
      });

      return {
        id: updatedLoan.id,
        status: updatedLoan.status,
        returnDate: updatedLoan.returnDate,
        fineGenerated,
      };
    });
  }

  static async renew(loanId: number, requestedByUser: { id: number; role: string }) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
        },
      });

      if (!loan) {
        throw new NotFoundError(`Loan with id ${loanId} not found`);
      }

      // Ownership check for Member
      if (requestedByUser.role === 'MEMBER' && loan.memberId !== requestedByUser.id) {
        throw new ForbiddenError('You can only renew your own loans');
      }

      if (loan.status === 'RETURNED' || loan.status === 'LOST') {
        throw new ConflictError(`Cannot renew loan with status ${loan.status}`, 'CANNOT_RENEW');
      }

      if (loan.renewalCount >= env.LOAN_MAX_RENEWALS) {
        throw new ConflictError(
          `Renewal limit reached (${env.LOAN_MAX_RENEWALS} renewals max)`,
          'MAX_RENEWALS_REACHED'
        );
      }

      // Check competing reservation (FR-D3 & FR-E1)
      const competingReservation = await tx.reservation.findFirst({
        where: {
          bookId: loan.bookCopy.bookId,
          status: 'PENDING',
          memberId: { not: loan.memberId },
        },
      });

      if (competingReservation) {
        throw new ConflictError(
          'Cannot renew because another member has placed a reservation on this title',
          'ACTIVE_RESERVATION_EXISTS'
        );
      }

      const currentDue = new Date(loan.dueDate);
      const newDue = formatDate(addDays(currentDue, env.LOAN_DEFAULT_PERIOD_DAYS));

      const updated = await tx.loan.update({
        where: { id: loan.id },
        data: {
          dueDate: newDue,
          renewalCount: loan.renewalCount + 1,
          status: 'ONGOING', // reset overdue if extended into the future
        },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
          member: true,
        },
      });

      return updated;
    });
  }

  static async listLoans(query: any, currentUser: { id: number; role: string }) {
    const { skip, take, page, size, orderBy } = parsePagination(query, 'id', 'desc');

    const where: any = {};

    // Enforce role scoping: Members only ever see their own rows regardless of query params!
    if (currentUser.role === 'MEMBER') {
      where.memberId = currentUser.id;
    } else if (query.memberId) {
      where.memberId = parseInt(query.memberId, 10);
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, loans] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
          member: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          librarian: {
            select: {
              id: true,
              fullName: true,
            },
          },
          fines: true,
        },
      }),
    ]);

    return toPageResponse(loans, total, page, size);
  }

  static async getById(loanId: number, currentUser: { id: number; role: string }) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        bookCopy: {
          include: {
            book: true,
          },
        },
        member: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        librarian: {
          select: {
            id: true,
            fullName: true,
          },
        },
        fines: true,
      },
    });

    if (!loan) {
      throw new NotFoundError(`Loan with id ${loanId} not found`);
    }

    if (currentUser.role === 'MEMBER' && loan.memberId !== currentUser.id) {
      throw new ForbiddenError('You can only view your own loan details');
    }

    return loan;
  }

  static async reportLostOrDamaged(loanId: number, type: 'LOST' | 'DAMAGED', fineAmount = 200000) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          bookCopy: {
            include: {
              book: true,
            },
          },
        },
      });

      if (!loan) {
        throw new NotFoundError(`Loan with id ${loanId} not found`);
      }

      if (loan.status === 'RETURNED' || loan.status === 'LOST') {
        throw new ConflictError(`Loan is already closed with status ${loan.status}`, 'CANNOT_CLOSE');
      }

      const today = formatDate(new Date());

      // Update copy
      await tx.bookCopy.update({
        where: { id: loan.bookCopyId },
        data: { status: type },
      });

      // Update loan
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'LOST',
          returnDate: today,
        },
      });

      // Create fine
      const fineReason = type === 'LOST' ? 'LOST_BOOK' : 'DAMAGED_BOOK';
      const fine = await tx.fine.create({
        data: {
          loanId: loan.id,
          memberId: loan.memberId,
          amount: fineAmount,
          reason: fineReason,
          status: 'UNPAID',
          issuedDate: today,
        },
      });

      return {
        loanId: loan.id,
        status: 'LOST',
        fine,
      };
    });
  }
}
