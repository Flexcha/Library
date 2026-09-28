import { Response } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details: any[];
  };
  timestamp: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'OK', statusCode = 200): Response {
    const payload: SuccessResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message = 'OK'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    code: string,
    message: string,
    details: any[] = [],
    statusCode = 500,
  ): Response {
    const payload: ErrorEnvelope = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
