import { Router } from 'express';
import { RentalController } from './rental.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createRentalSchema, updateRentalStatusSchema } from './rental.validation';

// ---- Tenant-facing routes: mounted at /api/rentals ----
const rentalRouter = Router();

rentalRouter.post(
  '/',
  auth,
  authorize('TENANT'),
  validate(createRentalSchema),
  RentalController.create
);
rentalRouter.get('/', auth, authorize('TENANT'), RentalController.getMyRequests);
rentalRouter.get('/:id', auth, RentalController.getById);

// ---- Landlord-facing routes: mounted at /api/landlord ----
const landlordRouter = Router();

landlordRouter.get(
  '/requests',
  auth,
  authorize('LANDLORD'),
  RentalController.getLandlordRequests
);
landlordRouter.patch(
  '/requests/:id',
  auth,
  authorize('LANDLORD'),
  validate(updateRentalStatusSchema),
  RentalController.updateStatus
);

export const RentalRoutes = rentalRouter;
export const LandlordRoutes = landlordRouter;
