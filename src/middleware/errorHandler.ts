import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../common/errors/AppError.ts';
import { ApiResponse } from '../common/ApiResponse.ts';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  // 1. AppError subclasses
  if (err instanceof AppError) {
    ApiResponse.error(res, err.code, err.message, err.details, err.statusCode);
    return;
  }

  // 2. Prisma P2002 Unique Constraint Violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join('_')
        : String(err.meta?.target || '');

      let code = 'DUPLICATE_RESOURCE';
      let message = 'A duplicate record already exists.';

      if (target.includes('email') || err.message.includes('email')) {
        code = 'DUPLICATE_EMAIL';
        message = 'Email is already registered.';
      } else if (target.includes('isbn') || err.message.includes('isbn')) {
        code = 'DUPLICATE_ISBN';
        message = 'A book with this ISBN already exists.';
      } else if (target.includes('copy_code') || err.message.includes('copyCode') || err.message.includes('copy_code')) {
        code = 'DUPLICATE_COPY_CODE';
        message = 'A copy with this copy code already exists.';
      }

      ApiResponse.error(res, code, message, [], 409);
      return;
    }

    if (err.code === 'P2025') {
      ApiResponse.error(res, 'RESOURCE_NOT_FOUND', 'Requested resource was not found.', [], 404);
      return;
    }
  }

  // 3. Fallback for unhandled errors
  console.error('[Unhandled Server Error]:', err);
  const message = process.env.NODE_ENV === 'development' ? err.message || 'Internal server error' : 'Internal server error';
  ApiResponse.error(res, 'INTERNAL_SERVER_ERROR', message, [], 500);
};
