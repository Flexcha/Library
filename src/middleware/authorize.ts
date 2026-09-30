import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors/AppError.ts';

type AllowedRole = 'SUPERADMIN' | 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export const authorize = (...allowedRoles: AllowedRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SUPERADMIN bypasses all role checks
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role as AllowedRole)) {
      return next(new ForbiddenError('You do not have permission to access this resource', 'FORBIDDEN'));
    }

    next();
  };
};
