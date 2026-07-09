import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { PropertyRoutes } from '../modules/property/property.routes';
import { RentalRoutes, LandlordRoutes } from '../modules/rental/rental.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';

const router = Router();

const routes = [
  { path: '/auth', handler: AuthRoutes },
  { path: '/categories', handler: CategoryRoutes },
  { path: '/properties', handler: PropertyRoutes },
  { path: '/rentals', handler: RentalRoutes },
  { path: '/landlord', handler: LandlordRoutes },
  { path: '/payments', handler: PaymentRoutes },
  { path: '/reviews', handler: ReviewRoutes },
  { path: '/admin', handler: AdminRoutes },
];

routes.forEach((route) => router.use(route.path, route.handler));

export default router;
