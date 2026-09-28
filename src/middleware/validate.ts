import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../common/errors/AppError.ts';

interface ValidationTargets {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validate = (targets: ValidationTargets | ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parse' in targets && typeof (targets as any).parse === 'function') {
        req.body = (targets as ZodSchema<any>).parse(req.body);
      } else {
        const { body, query, params } = targets as ValidationTargets;
        if (body) req.body = body.parse(req.body);
        if (query) req.query = query.parse(req.query);
        if (params) req.params = params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          rule: issue.code,
        }));
        return next(new ValidationError('Request validation failed', details));
      }
      next(err);
    }
  };
};
