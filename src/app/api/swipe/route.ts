import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { swipedId, isLike } = await req.json();

    // 1. Get internal ID of swiper
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    const swiperId = member.id;

    // 2. Save the swipe
    const { error: swipeError } = await supabase
      .from('swipes')
      .upsert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        is_like: isLike
      }, { onConflict: 'swiper_id,swiped_id' });

    if (swipeError) throw swipeError;

    // 3. If it's a Pass, we stop here
    if (!isLike) {
      return NextResponse.json({ match: false });
    }

    // 4. Check if it's a match (reciprocity)
    const { data: reciprocate } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', swipedId)
      .eq('swiped_id', swiperId)
      .eq('is_like', true)
      .single();

    if (reciprocate) {
      // 5. Create conversation (sorting IDs to maintain uniqueness of room key)
      const [u1, u2] = [swiperId, swipedId].sort();
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .upsert({ user_1: u1, user_2: u2 }, { onConflict: 'user_1,user_2' })
        .select()
        .single();

      if (convError) throw convError;

      return NextResponse.json({ match: true, conversationId: conv.id });
    }

    return NextResponse.json({ match: false });
  } catch (err: any) {
    console.error('Error swiping:', err);
    return NextResponse.json({ error: 'Erreur lors du swipe' }, { status: 500 });
  }
}
