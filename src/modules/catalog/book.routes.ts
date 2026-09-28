import { Router, Request, Response } from 'express';
import { BookService } from './book.service.ts';
import { BookCopyService } from './bookCopy.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import {
  createBookSchema,
  updateBookSchema,
  bookCopySchema,
  updateCopyStatusSchema,
  bookQuerySchema,
} from './catalog.schema.ts';

const router = Router();

// Books routes
router.get('/', validate({ query: bookQuerySchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await BookService.list(req.query);
  return ApiResponse.success(res, result);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const book = await BookService.getById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, book);
}));

router.post('/', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(createBookSchema), asyncHandler(async (req: Request, res: Response) => {
  const book = await BookService.create(req.body);
  return ApiResponse.created(res, book);
}));

router.put('/:id', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(updateBookSchema), asyncHandler(async (req: Request, res: Response) => {
  const book = await BookService.update(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, book);
}));

router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const result = await BookService.delete(parseInt(req.params.id, 10));
  return ApiResponse.success(res, result);
}));

// Copies nested under book
router.get('/:bookId/copies', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let isStaff = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { JwtUtil } = await import('../auth/jwt.util.ts');
      const payload = JwtUtil.verifyAccessToken(authHeader.substring(7));
      if (payload.role === 'ADMIN' || payload.role === 'LIBRARIAN') {
        isStaff = true;
      }
    } catch {
      // Ignore unauthenticated / invalid token for optional staff check
    }
  }

  const copies = await BookCopyService.listByBook(parseInt(req.params.bookId, 10), isStaff);
  return ApiResponse.success(res, copies);
}));

router.post('/:bookId/copies', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(bookCopySchema), asyncHandler(async (req: Request, res: Response) => {
  const copy = await BookCopyService.addCopy(parseInt(req.params.bookId, 10), req.body);
  return ApiResponse.created(res, copy);
}));

export const bookRoutes = router;

// Top-level copies router for /copies/:id/status
const copyRouter = Router();

copyRouter.patch('/:id/status', authenticate, authorize('ADMIN', 'LIBRARIAN'), validate(updateCopyStatusSchema), asyncHandler(async (req: Request, res: Response) => {
  const copy = await BookCopyService.updateStatus(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, copy, 'Copy status updated successfully');
}));

export const copyRoutes = copyRouter;
