import { Router } from 'express';
import { AdminController } from './admin.controller';
import { auth } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { updateUserStatusSchema } from './admin.validation';

const router = Router();

// Every admin route requires an authenticated ADMIN
router.use(auth, authorize('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id', validate(updateUserStatusSchema), AdminController.updateUserStatus);
router.get('/properties', AdminController.getAllProperties);
router.get('/rentals', AdminController.getAllRentals);

export const AdminRoutes = router;
