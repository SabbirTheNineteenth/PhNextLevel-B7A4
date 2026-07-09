import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../lib/prisma';

// Extend Express Request to carry the authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not authorized. Please login.');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Make sure the user still exists and is not banned
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new AppError(401, 'User no longer exists.');
    }
    if (user.status === 'BANNED') {
      throw new AppError(403, 'Your account has been banned.');
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    // jwt errors (expired/invalid) also land here
    if (err instanceof AppError) return next(err);
    return next(new AppError(401, 'Invalid or expired token.'));
  }
};

export default auth;
