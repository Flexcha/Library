import cron from 'node-cron';
import { prisma } from '../../config/prisma.ts';

export async function flagOverdueLoans() {
  const today = new Date().toISOString().split('T')[0];

  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'ONGOING',
      dueDate: { lt: today },
    },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
    },
  });

  if (overdueLoans.length === 0) return 0;

  for (const loan of overdueLoans) {
    await prisma.loan.update({
      where: { id: loan.id },
      data: { status: 'OVERDUE' },
    });

    // Check if member already notified for this loan overdue
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId: loan.memberId,
        type: 'OVERDUE',
        message: { contains: loan.bookCopy.book.title },
      },
    });

    if (!existingNotif) {
      await prisma.notification.create({
        data: {
          userId: loan.memberId,
          type: 'OVERDUE',
          message: `Your loan for "${loan.bookCopy.book.title}" was due on ${loan.dueDate} and is now overdue. Please return it to avoid additional fines.`,
        },
      });
    }
  }

  return overdueLoans.length;
}

export function registerCirculationJobs() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const count = await flagOverdueLoans();
      console.log(`[Scheduled Job] Flagged ${count} overdue loans.`);
    } catch (err) {
      console.error('[Scheduled Job Error - flagOverdueLoans]:', err);
    }
  });
}
