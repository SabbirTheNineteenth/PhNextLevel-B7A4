import { Router } from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createPropertySchema, updatePropertySchema } from './property.validation';

const router = Router();

// ---- Public ----
router.get('/', PropertyController.getAll);
router.get('/:id', PropertyController.getById);

// ---- Landlord management ----
router.post(
  '/',
  auth,
  authorize('LANDLORD'),
  validate(createPropertySchema),
  PropertyController.create
);
router.put(
  '/:id',
  auth,
  authorize('LANDLORD'),
  validate(updatePropertySchema),
  PropertyController.update
);
router.delete('/:id', auth, authorize('LANDLORD'), PropertyController.remove);

export const PropertyRoutes = router;
