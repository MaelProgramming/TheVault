import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkAuth } from '@/lib/checkAuth';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
});

export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe API Key configuration error.');
    return NextResponse.json({ error: 'Erreur de configuration Stripe' }, { status: 500 });
  }

  try {
    // Check if the user profile exists
    const { data: member } = await supabase
      .from('members')
      .select('id, email, is_verified')
      .eq('email', user.email)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    if (member.is_verified) {
      return NextResponse.json({ error: 'Déjà vérifié' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    let priceId = process.env.STRIPE_PRICE_ID;

    // Verify if the configured price ID exists in the current environment
    if (priceId) {
      try {
        await stripe.prices.retrieve(priceId);
      } catch (err) {
        console.warn(`Price ID ${priceId} not found in the current Stripe environment. Falling back.`);
        priceId = undefined;
      }
    }

    // Dynamically resolve default price from product if no price ID is provided/found
    if (!priceId && process.env.STRIPE_PRODUCT_ID) {
      try {
        const product = await stripe.products.retrieve(process.env.STRIPE_PRODUCT_ID);
        if (product.default_price) {
          priceId = typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price.id;
        }
      } catch (err) {
        console.warn(`Product ID ${process.env.STRIPE_PRODUCT_ID} or its default price not found in current Stripe environment. Falling back.`);
      }
    }

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Entrada al club | The Vault',
              description: 'Es la entrada al club de elite de The Vault',
            },
            unit_amount: 8000, // 80.00 EUR in cents
          },
          quantity: 1,
        }];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        email: user.email,
        member_id: member.id,
      },
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de la session de paiement' }, { status: 500 });
  }
}
