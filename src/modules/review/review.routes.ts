import { Router } from 'express';
import { ReviewController } from './review.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createReviewSchema } from './review.validation';

const router = Router();

router.post(
  '/',
  auth,
  authorize('TENANT'),
  validate(createReviewSchema),
  ReviewController.create
);

export const ReviewRoutes = router;
