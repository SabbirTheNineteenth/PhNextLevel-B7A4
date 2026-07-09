import { Request, Response } from 'express';

// Catches any request that did not match a route.
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorDetails: [
      { path: req.originalUrl, message: 'This API route does not exist.' },
    ],
  });
};

export default notFound;
