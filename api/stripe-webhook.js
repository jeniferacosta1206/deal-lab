// Vercel serverless function that receives Stripe webhook events.
// When Stripe confirms a payment, this updates the user's profile to paid=true.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable Vercel's default body parser so we get the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: read the raw body buffer
async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const customerId = session.customer;

      if (!userId) {
        console.error('Webhook: no user_id in metadata');
        return res.status(400).json({ error: 'Missing user_id in session metadata' });
      }

      // Mark user as paid
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          stripe_customer_id: customerId,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      console.log(`User ${userId} marked as paid.`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
