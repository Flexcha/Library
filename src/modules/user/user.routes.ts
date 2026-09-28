import { Router } from 'express';
import { UserController } from './user.controller.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { updateUserSchema, updateStatusSchema, userQuerySchema } from './user.schema.ts';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), validate({ query: userQuerySchema }), asyncHandler(UserController.list));
router.get('/:id', asyncHandler(UserController.getById));
router.put('/:id', validate({ body: updateUserSchema }), asyncHandler(UserController.update));
router.patch('/:id/status', authorize('ADMIN'), validate({ body: updateStatusSchema }), asyncHandler(UserController.updateStatus));
router.delete('/:id', authorize('ADMIN'), asyncHandler(UserController.remove));

export const userRoutes = router;
