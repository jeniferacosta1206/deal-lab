// Vercel serverless function to create a Stripe Checkout session.
// Called by the frontend when a user clicks "Buy Lifetime Access".
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the user's Supabase JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing auth token' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }

    // Get the request body
    const { promoCode } = req.body || {};

    // Get the user's profile to check current state
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.paid) {
      return res.status(400).json({ error: 'You already have lifetime access' });
    }

    // Build checkout session params
    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${req.headers.origin || 'https://deallab.jeniferacosta.com'}?payment=success`,
      cancel_url: `${req.headers.origin || 'https://deallab.jeniferacosta.com'}?payment=cancelled`,
      metadata: {
        user_id: user.id,
        promo_code: promoCode || '',
      },
    };

    // If a percent-off promo code is provided, attach it as a Stripe promotion code lookup.
    // For v1, percent-off codes need to also exist in Stripe's Promotion Codes panel.
    if (promoCode) {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
