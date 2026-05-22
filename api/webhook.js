import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      await supabase.from('subscribers').upsert({
        email: session.customer_email,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'trialing',
        plan: 'premium',
      });
      break;

    case 'customer.subscription.updated':
      await supabase.from('subscribers')
        .update({ status: session.status })
        .eq('stripe_subscription_id', session.id);
      break;

    case 'customer.subscription.deleted':
      await supabase.from('subscribers')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', session.id);
      break;
  }

  res.status(200).json({ received: true });
}