import { Router } from 'express'; // Trigger Nodemon restart
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_prevent_crash_during_hot_reload', {
  apiVersion: '2023-10-16',
});

const router = Router();

router.post('/create-checkout-session', authenticate, async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business) return res.status(404).json({ message: 'Negocio no encontrado' });

    let customerId = business.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { businessId: business.id.toString() }
      });
      customerId = customer.id;
      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID; 
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 15, // 15 días gratis de acuerdo a notas de Director
      },
      success_url: `${frontendUrl}/admin?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/admin/billing`,
      metadata: { businessId: business.id.toString() }
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

router.post('/customer-portal', authenticate, async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business || !business.stripeCustomerId) {
      return res.status(404).json({ message: 'No se encontró un cliente de pago.' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${frontendUrl}/admin`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoint: Needs raw body parsing. We will mount this separately or apply raw middleware in index.js
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.metadata?.businessId) {
          await prisma.business.update({
            where: { id: parseInt(session.metadata.businessId) },
            data: { subscriptionStatus: 'trialing', stripeSubscriptionId: session.subscription }
          });
        }
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (customer.metadata?.businessId) {
          await prisma.business.update({
            where: { id: parseInt(customer.metadata.businessId) },
            data: { 
              subscriptionStatus: subscription.status,
              trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            }
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
  }

  res.status(200).json({ received: true });
};

export default router;
