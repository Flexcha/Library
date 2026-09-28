import { Router, Request, Response } from 'express';
import { NotificationService } from './notification.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const notifications = await NotificationService.listUserNotifications(req.user!.id, unreadOnly);
  return ApiResponse.success(res, notifications);
}));

router.patch('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const result = await NotificationService.markAsRead(id, req.user!.id);
  return ApiResponse.success(res, result, 'Notification marked as read');
}));

router.patch('/read-all', asyncHandler(async (req: Request, res: Response) => {
  await NotificationService.markAllAsRead(req.user!.id);
  return ApiResponse.success(res, null, 'All notifications marked as read');
}));

export const notificationRoutes = router;
