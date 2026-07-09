import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps an async controller so any thrown/rejected error
// is forwarded to the global error handler via next().
export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
