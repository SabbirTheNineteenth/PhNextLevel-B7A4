import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';

const sanitize = (user: { password: string } & Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};

const register = async (payload: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new AppError(409, 'A user with this email already exists.');
  }

  const hashed = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashed,
      phone: payload.phone,
      role: payload.role,
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: sanitize(user), token };
};

const login = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  if (user.status === 'BANNED') {
    throw new AppError(403, 'Your account has been banned.');
  }

  const matched = await bcrypt.compare(payload.password, user.password);
  if (!matched) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: sanitize(user), token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found.');
  }
  return sanitize(user);
};

export const AuthService = { register, login, getMe };
