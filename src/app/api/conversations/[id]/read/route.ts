import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: convId } = await params;
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!me) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });
    }

    // Mark messages as read where sender is NOT the current user and conversation is convId
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', me.id)
      .eq('is_read', false);

    if (error) throw error;

    return NextResponse.json({ message: 'Correspondencia marcada como leída' });
  } catch (err: any) {
    console.error('Error marking messages as read:', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
