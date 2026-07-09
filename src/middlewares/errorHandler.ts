import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface ErrorDetail {
  path: string | number;
  message: string;
}

// Global error handler.
// Every error response has the shape:
// { success: false, message: string, errorDetails: [...] }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails: ErrorDetail[] = [];

  // 1) Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  }

  // 2) Our own operational errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = [{ path: '', message: err.message }];
  }

  // 3) Prisma known request errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      message = `Duplicate value for unique field: ${target}`;
      errorDetails = [{ path: target, message }];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      errorDetails = [{ path: '', message }];
    } else {
      statusCode = 400;
      message = `Database error (${err.code})`;
      errorDetails = [{ path: '', message: err.message }];
    }
  }

  // 4) Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data sent to database';
    errorDetails = [{ path: '', message }];
  }

  // 5) JWT errors
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
    errorDetails = [{ path: '', message }];
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token.';
    errorDetails = [{ path: '', message }];
  }

  // 6) Anything else
  else if (err instanceof Error) {
    message = err.message || message;
    errorDetails = [{ path: '', message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    ...(env.nodeEnv === 'development' && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};

export default errorHandler;
