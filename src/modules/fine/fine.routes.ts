import { Router, Request, Response } from 'express';
import { FineService } from './fine.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { fineQuerySchema, waiveFineSchema } from './fine.schema.ts';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: fineQuerySchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await FineService.listFines(req.query, req.user!);
  return ApiResponse.success(res, result);
}));

router.patch('/:id/pay', authorize('ADMIN', 'LIBRARIAN'), asyncHandler(async (req: Request, res: Response) => {
  const fineId = parseInt(req.params.id, 10);
  const result = await FineService.payFine(fineId);
  return ApiResponse.success(res, result, 'Fine recorded as paid successfully');
}));

router.patch('/:id/waive', authorize('ADMIN'), validate({ body: waiveFineSchema }), asyncHandler(async (req: Request, res: Response) => {
  const fineId = parseInt(req.params.id, 10);
  const reason = req.body?.reason;
  const result = await FineService.waiveFine(fineId, req.user!.id, reason);
  return ApiResponse.success(res, result, 'Fine waived successfully');
}));

export const fineRoutes = router;
