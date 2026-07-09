import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
};
