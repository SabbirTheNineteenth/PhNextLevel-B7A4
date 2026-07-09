import Stripe from 'stripe';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

let stripeInstance: Stripe | null = null;

// Lazily initialise Stripe so the app can still boot for non-payment
// testing even if the key is not set yet.
export const getStripe = (): Stripe => {
  if (!env.stripe.secretKey) {
    throw new AppError(
      500,
      'Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.'
    );
  }
  if (!stripeInstance) {
    // apiVersion omitted on purpose: the SDK pins a sensible default,
    // and hardcoding a version can break across stripe package upgrades.
    stripeInstance = new Stripe(env.stripe.secretKey);
  }
  return stripeInstance;
};
