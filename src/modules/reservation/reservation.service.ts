import { prisma } from '../../config/prisma.ts';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/AppError.ts';
import { parsePagination, toPageResponse } from '../../common/pagination.ts';

export class ReservationService {
  static async createReservation(bookId: number, memberId: number) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundError(`Book with id ${bookId} not found`);
    }

    // Check if member already has active loan on this book title
    const activeLoan = await prisma.loan.findFirst({
      where: {
        memberId,
        status: { in: ['ONGOING', 'OVERDUE'] },
        bookCopy: { bookId },
      },
    });

    if (activeLoan) {
      throw new ConflictError(
        'You already have an active loan on this title and cannot place a reservation',
        'ACTIVE_LOAN_EXISTS'
      );
    }

    // Check if member already has active reservation on this book title
    const activeReservation = await prisma.reservation.findFirst({
      where: {
        memberId,
        bookId,
        status: { in: ['PENDING', 'READY'] },
      },
    });

    if (activeReservation) {
      throw new ConflictError(
        'You already have an active reservation for this title',
        'ACTIVE_RESERVATION_EXISTS'
      );
    }

    // Calculate queue position
    const lastInQueue = await prisma.reservation.findFirst({
      where: {
        bookId,
        status: 'PENDING',
      },
      orderBy: {
        queuePosition: 'desc',
      },
    });

    const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

    const reservation = await prisma.reservation.create({
      data: {
        bookId,
        memberId,
        queuePosition,
        status: 'PENDING',
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
          },
        },
        member: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return reservation;
  }

  static async cancelReservation(reservationId: number, currentUser: { id: number; role: string }) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        book: true,
      },
    });

    if (!reservation) {
      throw new NotFoundError(`Reservation with id ${reservationId} not found`);
    }

    if (currentUser.role === 'MEMBER' && reservation.memberId !== currentUser.id) {
      throw new ForbiddenError('You can only cancel your own reservations');
    }

    if (reservation.status !== 'PENDING' && reservation.status !== 'READY') {
      throw new ConflictError(
        `Cannot cancel reservation with status ${reservation.status}`,
        'CANNOT_CANCEL_RESERVATION'
      );
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });

    // If reservation was READY, a copy was held for it! Re-allocate copy
    if (reservation.status === 'READY') {
      const reservedCopy = await prisma.bookCopy.findFirst({
        where: {
          bookId: reservation.bookId,
          status: 'RESERVED',
        },
      });

      if (reservedCopy) {
        // Find next pending reservation
        const nextInQueue = await prisma.reservation.findFirst({
          where: {
            bookId: reservation.bookId,
            status: 'PENDING',
          },
          orderBy: {
            queuePosition: 'asc',
          },
        });

        if (nextInQueue) {
          const today = new Date();
          const expiryDate = new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0];
          await prisma.reservation.update({
            where: { id: nextInQueue.id },
            data: {
              status: 'READY',
              expiryDate,
            },
          });

          await prisma.notification.create({
            data: {
              userId: nextInQueue.memberId,
              type: 'RESERVATION_READY',
              message: `Your reservation for "${reservation.book.title}" is ready for pickup until ${expiryDate}!`,
            },
          });
        } else {
          // Release copy back to AVAILABLE
          await prisma.bookCopy.update({
            where: { id: reservedCopy.id },
            data: { status: 'AVAILABLE' },
          });
        }
      }
    }

    return updated;
  }

  static async listReservations(query: any, currentUser: { id: number; role: string }) {
    const { skip, take, page, size, orderBy } = parsePagination(query, 'reservationDate', 'desc');

    const where: any = {};

    if (currentUser.role === 'MEMBER') {
      where.memberId = currentUser.id;
    } else if (query.memberId) {
      where.memberId = parseInt(query.memberId, 10);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.bookId) {
      where.bookId = parseInt(query.bookId, 10);
    }

    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              coverImageUrl: true,
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
        },
      }),
    ]);

    return toPageResponse(reservations, total, page, size);
  }
}
