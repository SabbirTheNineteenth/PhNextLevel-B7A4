import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { PaymentController } from './modules/payment/payment.controller';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// ---- Stripe webhook (MUST come before express.json to keep raw body) ----
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.webhook
);

// ---- Global middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'RentNest API is running 🏠',
    docs: '/api-docs',
  });
});

// ---- API docs (Swagger UI) ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- API routes ----
app.use('/api', apiRoutes);

// ---- 404 + error handling ----
app.use(notFound);
app.use(errorHandler);

export default app;
