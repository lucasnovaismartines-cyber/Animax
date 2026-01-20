/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
import 'server-only';
import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});
