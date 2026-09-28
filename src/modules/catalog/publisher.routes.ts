import { Router, Request, Response } from 'express';
import { PublisherService } from './publisher.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { publisherSchema } from './catalog.schema.ts';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const publishers = await PublisherService.list();
  return ApiResponse.success(res, publishers);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const publisher = await PublisherService.getById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, publisher);
}));

router.post('/', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(publisherSchema), asyncHandler(async (req: Request, res: Response) => {
  const publisher = await PublisherService.create(req.body);
  return ApiResponse.created(res, publisher);
}));

router.put('/:id', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(publisherSchema), asyncHandler(async (req: Request, res: Response) => {
  const publisher = await PublisherService.update(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, publisher);
}));

router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const result = await PublisherService.delete(parseInt(req.params.id, 10));
  return ApiResponse.success(res, result);
}));

export const publisherRoutes = router;
