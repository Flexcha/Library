import cron from 'node-cron';
import { prisma } from '../../config/prisma.ts';

export async function sendDueSoonReminders(daysAhead = 2) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const dueSoonLoans = await prisma.loan.findMany({
    where: {
      status: 'ONGOING',
      dueDate: targetDateStr,
    },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
    },
  });

  if (dueSoonLoans.length === 0) return 0;

  let createdCount = 0;
  for (const loan of dueSoonLoans) {
    // Check if member already received DUE_SOON notification for this loan
    const existing = await prisma.notification.findFirst({
      where: {
        userId: loan.memberId,
        type: 'DUE_SOON',
        message: { contains: loan.bookCopy.book.title },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: loan.memberId,
          type: 'DUE_SOON',
          message: `Reminder: Your loan for "${loan.bookCopy.book.title}" is due in ${daysAhead} days on ${loan.dueDate}.`,
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}

export function registerNotificationJobs() {
  // Run daily at 8 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      const count = await sendDueSoonReminders(2);
      console.log(`[Scheduled Job] Sent ${count} due-soon reminders.`);
    } catch (err) {
      console.error('[Scheduled Job Error - sendDueSoonReminders]:', err);
    }
  });
}
