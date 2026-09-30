import { Router } from 'express';
import { UserController } from './user.controller.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { createUserSchema, updateUserSchema, updateStatusSchema, updateRoleSchema, userQuerySchema } from './user.schema.ts';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPERADMIN', 'ADMIN', 'LIBRARIAN'), validate({ query: userQuerySchema }), asyncHandler(UserController.list));
router.post('/', authorize('SUPERADMIN', 'ADMIN'), validate({ body: createUserSchema }), asyncHandler(UserController.create));
router.get('/:id', asyncHandler(UserController.getById));
router.put('/:id', validate({ body: updateUserSchema }), asyncHandler(UserController.update));
router.patch('/:id/status', authorize('SUPERADMIN', 'ADMIN'), validate({ body: updateStatusSchema }), asyncHandler(UserController.updateStatus));
router.patch('/:id/role', authorize('SUPERADMIN', 'ADMIN'), validate({ body: updateRoleSchema }), asyncHandler(UserController.updateRole));
router.delete('/:id', authorize('SUPERADMIN', 'ADMIN'), asyncHandler(UserController.remove));

export const userRoutes = router;
