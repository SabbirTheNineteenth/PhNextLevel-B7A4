import { Router } from 'express';
import { CategoryController } from './category.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from './category.validation';

const router = Router();

// Public
router.get('/', CategoryController.getAll);

// Admin only
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  validate(createCategorySchema),
  CategoryController.create
);
router.patch(
  '/:id',
  auth,
  authorize('ADMIN'),
  validate(updateCategorySchema),
  CategoryController.update
);
router.delete('/:id', auth, authorize('ADMIN'), CategoryController.remove);

export const CategoryRoutes = router;
