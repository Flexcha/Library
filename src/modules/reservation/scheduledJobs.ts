import cron from 'node-cron';
import { prisma } from '../../config/prisma.ts';

export async function expireOverdueReservations() {
  const today = new Date().toISOString().split('T')[0];

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: 'READY',
      expiryDate: { lt: today },
    },
    include: {
      book: true,
    },
  });

  if (expiredReservations.length === 0) return 0;

  for (const res of expiredReservations) {
    // 1. Mark reservation as EXPIRED
    await prisma.reservation.update({
      where: { id: res.id },
      data: { status: 'EXPIRED' },
    });

    // 2. Find the reserved copy for this book
    const copy = await prisma.bookCopy.findFirst({
      where: {
        bookId: res.bookId,
        status: 'RESERVED',
      },
    });

    if (copy) {
      // 3. Check next in queue
      const nextInQueue = await prisma.reservation.findFirst({
        where: {
          bookId: res.bookId,
          status: 'PENDING',
        },
        orderBy: {
          queuePosition: 'asc',
        },
      });

      if (nextInQueue) {
        const nextExpiry = new Date();
        nextExpiry.setDate(nextExpiry.getDate() + 3);
        const expiryStr = nextExpiry.toISOString().split('T')[0];

        await prisma.reservation.update({
          where: { id: nextInQueue.id },
          data: {
            status: 'READY',
            expiryDate: expiryStr,
          },
        });

        await prisma.notification.create({
          data: {
            userId: nextInQueue.memberId,
            type: 'RESERVATION_READY',
            message: `Your reservation for "${res.book.title}" is ready for pickup until ${expiryStr}!`,
          },
        });
      } else {
        // No one else waiting -> copy becomes AVAILABLE
        await prisma.bookCopy.update({
          where: { id: copy.id },
          data: { status: 'AVAILABLE' },
        });
      }
    }
  }

  return expiredReservations.length;
}

export function registerReservationJobs() {
  // Run daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      const count = await expireOverdueReservations();
      console.log(`[Scheduled Job] Expired ${count} overdue reservations.`);
    } catch (err) {
      console.error('[Scheduled Job Error - expireOverdueReservations]:', err);
    }
  });
}
