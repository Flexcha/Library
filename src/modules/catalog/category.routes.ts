import { Router, Request, Response } from 'express';
import { CategoryService } from './category.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { categorySchema } from './catalog.schema.ts';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryService.list();
  return ApiResponse.success(res, categories);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.getById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, category);
}));

router.post('/', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(categorySchema), asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.create(req.body);
  return ApiResponse.created(res, category);
}));

router.put('/:id', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(categorySchema), asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.update(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, category);
}));

router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.delete(parseInt(req.params.id, 10));
  return ApiResponse.success(res, result);
}));

export const categoryRoutes = router;
