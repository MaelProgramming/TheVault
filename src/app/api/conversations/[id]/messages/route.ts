import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: convId } = await params;
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const lastTimestamp = searchParams.get('lastTimestamp') || searchParams.get('since');

    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId);

    if (lastTimestamp) {
      query = query.gt('created_at', lastTimestamp);
    }

    const { data: msgs, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    const mapped = msgs?.map((m: any) => ({
      ...m,
      is_mine: m.sender_id === (me?.id)
    }));

    return NextResponse.json(mapped || []);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    return NextResponse.json({ error: 'Erreur messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: convId } = await params;
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    // 1. Get internal ID
    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!me) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });
    }

    // 2. Security check: is the user a participant in this conversation?
    const { data: isParticipant, error: authError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', convId)
      .or(`user_1.eq.${me.id},user_2.eq.${me.id}`)
      .single();

    if (authError || !isParticipant) {
      console.warn(`Tentative d'intrusion : User ${me.id} sur Conv ${convId}`);
      return NextResponse.json({ error: 'Accès au coffre refusé. Cette conversation ne vous appartient pas.' }, { status: 403 });
    }

    // 3. Secure insert
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: convId, sender_id: me.id, content }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, is_mine: true }, { status: 201 });
  } catch (err: any) {
    console.error('Error sending message:', err);
    return NextResponse.json({ error: 'Erreur système lors de l’envoi' }, { status: 500 });
  }
}
