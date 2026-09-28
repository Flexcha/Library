export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: any[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details: any[] = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'RESOURCE_NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthenticated', code = 'UNAUTHENTICATED') {
    super(message, 401, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: any[] = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
