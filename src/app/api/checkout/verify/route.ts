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
    return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session state and that the session corresponds to this user
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 });
    }

    const sessionEmail = session.metadata?.email || session.customer_details?.email;
    if (sessionEmail?.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Session non correspondante à l\'utilisateur' }, { status: 400 });
    }

    // Update member verified status
    const { data: member, error } = await supabase
      .from('members')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('email', user.email)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error('Verify checkout error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la vérification' }, { status: 500 });
  }
}
