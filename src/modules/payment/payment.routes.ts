import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createPaymentSchema, confirmPaymentSchema } from './payment.validation';

const router = Router();

// Note: the webhook route is registered separately in app.ts (needs raw body)

router.post(
  '/create',
  auth,
  authorize('TENANT'),
  validate(createPaymentSchema),
  PaymentController.create
);
router.post(
  '/confirm',
  auth,
  validate(confirmPaymentSchema),
  PaymentController.confirm
);
router.get('/', auth, PaymentController.getMyPayments);
router.get('/:id', auth, PaymentController.getById);

export const PaymentRoutes = router;
