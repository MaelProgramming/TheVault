'use server';

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
    // Verify member profile
    const { data: member } = await supabase
      .from('members')
      .select('id, email, is_verified, invited_by_founder')
      .eq('email', user.email)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // Only allow if invited by founder and not already verified
    if (!member.invited_by_founder) {
      return NextResponse.json({ error: 'Accès réservé aux invités par le fondateur' }, { status: 403 });
    }
    if (member.is_verified) {
      return NextResponse.json({ error: 'Déjà vérifié' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    let priceId = process.env.STRIPE_PRICE_ID_FOUNDER;

    // Validate price ID
    if (priceId) {
      try {
        await stripe.prices.retrieve(priceId);
      } catch (err) {
        console.warn(`Founder price ID ${priceId} not found. Falling back.`);
        priceId = undefined;
      }
    }

    // Fallback to a default price if none configured
    if (!priceId && process.env.STRIPE_PRODUCT_ID_FOUNDER) {
      try {
        const product = await stripe.products.retrieve(process.env.STRIPE_PRODUCT_ID_FOUNDER);
        if (product.default_price) {
          priceId = typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price.id;
        }
      } catch (err) {
        console.warn('Founder product ID not found.');
      }
    }

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Invitación del Founder – The Vault',
                description: 'Acceso al club para usuarios invitados por el fundador',
              },
              unit_amount: 8000, // 80.00 EUR in cents, can be adjusted
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        email: user.email,
        member_id: member.id,
        invited: true,
      },
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Founder Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de la session de paiement' }, { status: 500 });
  }
}
