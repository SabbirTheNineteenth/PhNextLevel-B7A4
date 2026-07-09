import dotenv from 'dotenv';

dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  jwt: {
    secret: required('JWT_SECRET', 'dev_secret_change_me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@rentnest.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'RentNest Admin',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
