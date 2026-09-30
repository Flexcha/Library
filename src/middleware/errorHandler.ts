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
      let message = 'Dữ liệu trùng lặp đã tồn tại trong hệ thống.';

      if (target.includes('email') || err.message.includes('email')) {
        code = 'DUPLICATE_EMAIL';
        message = 'Địa chỉ email này đã được đăng ký tài khoản.';
      } else if (target.includes('isbn') || err.message.includes('isbn')) {
        code = 'DUPLICATE_ISBN';
        message = 'Mã sách ISBN này đã tồn tại trong hệ thống.';
      } else if (target.includes('copy_code') || err.message.includes('copyCode') || err.message.includes('copy_code')) {
        code = 'DUPLICATE_COPY_CODE';
        message = 'Mã bản sao sách (Copy Code) này đã tồn tại.';
      }

      ApiResponse.error(res, code, message, [], 409);
      return;
    }

    if (err.code === 'P2025') {
      ApiResponse.error(res, 'RESOURCE_NOT_FOUND', 'Dữ liệu yêu cầu không tồn tại trong hệ thống.', [], 404);
      return;
    }
  }

  // 3. Fallback for unhandled errors
  console.error('[Unhandled Server Error]:', err);
  const message = process.env.NODE_ENV === 'development' ? err.message || 'Internal server error' : 'Internal server error';
  ApiResponse.error(res, 'INTERNAL_SERVER_ERROR', message, [], 500);
};
