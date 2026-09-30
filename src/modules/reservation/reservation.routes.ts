import { Router, Request, Response } from 'express';
import { ReservationService } from './reservation.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { createReservationSchema, reservationQuerySchema, updateReservationStatusSchema } from './reservation.schema.ts';

import { authorize } from '../../middleware/authorize.ts';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createReservationSchema }), asyncHandler(async (req: Request, res: Response) => {
  const reservation = await ReservationService.createReservation(req.body.bookId, req.user!.id);
  return ApiResponse.created(res, reservation, 'Reservation placed successfully');
}));

router.get('/', validate({ query: reservationQuerySchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await ReservationService.listReservations(req.query, req.user!);
  return ApiResponse.success(res, result);
}));

router.patch('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.id, 10);
  const result = await ReservationService.cancelReservation(reservationId, req.user!);
  return ApiResponse.success(res, result, 'Reservation cancelled successfully');
}));

router.patch('/:id/status', authorize('ADMIN', 'LIBRARIAN'), validate({ body: updateReservationStatusSchema }), asyncHandler(async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.id, 10);
  const result = await ReservationService.updateStatus(reservationId, req.body.status, req.user!);
  return ApiResponse.success(res, result, 'Reservation status updated successfully');
}));

export const reservationRoutes = router;
