import { Router } from 'express';
import { AuthController } from './auth.controller.ts';
import { validate } from '../../middleware/validate.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/me', authenticate, asyncHandler(AuthController.me));

export const authRoutes = router;
