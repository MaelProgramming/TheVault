import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    }

    const { data: convs, error } = await supabase
      .from('conversations')
      .select('id, user_1, user_2, user_1_data:members!user_1(id, full_name, avatar_url, major), user_2_data:members!user_2(id, full_name, avatar_url, major)')
      .or(`user_1.eq.${me.id},user_2.eq.${me.id}`);

    if (error) throw error;

    const mapped = convs?.map((c: any) => {
      const isUser1 = c.user_1 === me.id;
      const peer = isUser1 ? c.user_2_data : c.user_1_data;
      return {
        id: c.id,
        peer_id: peer.id,
        peer_name: peer.full_name,
        peer_avatar: peer.avatar_url,
        peer_major: peer.major,
      };
    });

    return NextResponse.json(mapped || []);
  } catch (err: any) {
    console.error('Error fetching conversations:', err);
    return NextResponse.json({ error: 'Impossible de charger les conversations' }, { status: 500 });
  }
}
