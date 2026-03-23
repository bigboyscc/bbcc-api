import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data
    });
  }

  static created<T>(res: Response, data: T) {
    return res.status(201).json({
      success: true,
      data
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(res: Response, message: string, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'ERROR',
        message
      }
    });
  }

  static notFound(res: Response, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message
      }
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    });
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      }
    });
  }
}
