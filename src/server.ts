import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.port, () => {
      console.log(`🚀 RentNest API running on http://localhost:${env.port}`);
      console.log(`📚 Swagger docs at http://localhost:${env.port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
