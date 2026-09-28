import { prisma } from '../../config/prisma.ts';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError.ts';

export class NotificationService {
  static async listUserNotifications(userId: number, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(id: number, userId: number) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      throw new NotFoundError(`Notification with id ${id} not found`);
    }

    if (notif.userId !== userId) {
      throw new ForbiddenError('You can only modify your own notifications');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
