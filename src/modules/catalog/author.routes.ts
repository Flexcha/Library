import { Router, Request, Response } from 'express';
import { AuthorService } from './author.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { authorSchema } from './catalog.schema.ts';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const authors = await AuthorService.list();
  return ApiResponse.success(res, authors);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const author = await AuthorService.getById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, author);
}));

router.post('/', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(authorSchema), asyncHandler(async (req: Request, res: Response) => {
  const author = await AuthorService.create(req.body);
  return ApiResponse.created(res, author);
}));

router.put('/:id', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(authorSchema), asyncHandler(async (req: Request, res: Response) => {
  const author = await AuthorService.update(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, author);
}));

router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthorService.delete(parseInt(req.params.id, 10));
  return ApiResponse.success(res, result);
}));

export const authorRoutes = router;
