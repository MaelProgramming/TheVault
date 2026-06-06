import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Signature manquante ou configuration invalide' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook Signature verification failed:`, err.message);
    return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const email = session.metadata?.email || session.customer_details?.email;
      
      if (!email) {
        console.error('No email found in Stripe Checkout Session event metadata/details');
        return NextResponse.json({ error: 'No email found in event' }, { status: 400 });
      }

      console.log(`Fulfilling purchase for member: ${email}`);

      // Update Supabase
      const { error } = await supabase
        .from('members')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        throw error;
      }
      
      console.log(`Successfully verified member profile for ${email}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
