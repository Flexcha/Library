import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../modules/auth/jwt.util.ts';
import { UnauthorizedError } from '../common/errors/AppError.ts';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = JwtUtil.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};
