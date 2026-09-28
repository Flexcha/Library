import { prisma } from '../../config/prisma.ts';

export class ReportService {
  static async getOverdueReport() {
    const today = new Date().toISOString().split('T')[0];

    const overdueLoans = await prisma.loan.findMany({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'ONGOING',
            dueDate: { lt: today },
          },
        ],
      },
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
            address: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return overdueLoans.map((l) => ({
      loanId: l.id,
      dueDate: l.dueDate,
      loanDate: l.loanDate,
      status: l.status,
      bookTitle: l.bookCopy.book.title,
      isbn: l.bookCopy.book.isbn,
      copyCode: l.bookCopy.copyCode,
      member: {
        id: l.member.id,
        fullName: l.member.fullName,
        email: l.member.email,
        phone: l.member.phone,
      },
    }));
  }

  static async getMostBorrowed(period = '30d') {
    const loans = await prisma.loan.findMany({
      include: {
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
    });

    const bookBorrowCounts = new Map<number, { book: any; count: number }>();

    for (const loan of loans) {
      const book = loan.bookCopy.book;
      const current = bookBorrowCounts.get(book.id) || { book, count: 0 };
      current.count++;
      bookBorrowCounts.set(book.id, current);
    }

    const sorted = Array.from(bookBorrowCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        isbn: item.book.isbn,
        coverImageUrl: item.book.coverImageUrl,
        borrowCount: item.count,
      }));

    return {
      period,
      ranking: sorted,
    };
  }

  static async getInventorySummary() {
    const copies = await prisma.bookCopy.findMany({
      select: {
        status: true,
      },
    });

    const counts: Record<string, number> = {
      AVAILABLE: 0,
      BORROWED: 0,
      RESERVED: 0,
      LOST: 0,
      DAMAGED: 0,
      WITHDRAWN: 0,
    };

    for (const copy of copies) {
      counts[copy.status] = (counts[copy.status] || 0) + 1;
    }

    const totalCopies = copies.length;
    const totalTitles = await prisma.book.count();

    return {
      totalTitles,
      totalCopies,
      byStatus: counts,
    };
  }

  static async getDashboardSummary() {
    const today = new Date().toISOString().split('T')[0];

    const [activeLoans, overdueLoans, pendingReservations, unpaidFines, totalBooks, totalMembers] = await Promise.all([
      prisma.loan.count({
        where: { status: 'ONGOING' },
      }),
      prisma.loan.count({
        where: {
          OR: [
            { status: 'OVERDUE' },
            {
              status: 'ONGOING',
              dueDate: { lt: today },
            },
          ],
        },
      }),
      prisma.reservation.count({
        where: { status: 'PENDING' },
      }),
      prisma.fine.findMany({
        where: { status: 'UNPAID' },
        select: { amount: true },
      }),
      prisma.book.count(),
      prisma.user.count({ where: { role: 'MEMBER' } }),
    ]);

    const totalUnpaidFinesAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    return {
      activeLoans,
      overdueLoans,
      pendingReservations,
      unpaidFinesCount: unpaidFines.length,
      unpaidFinesTotal: totalUnpaidFinesAmount,
      totalBooks,
      totalMembers,
    };
  }
}
