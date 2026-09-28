import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors/AppError.ts';

export const authorize = (...allowedRoles: Array<'ADMIN' | 'LIBRARIAN' | 'MEMBER'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource', 'FORBIDDEN'));
    }

    next();
  };
};
