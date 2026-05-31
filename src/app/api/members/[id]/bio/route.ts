import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { bio } = await req.json();

    // Verify user is editing their own bio
    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!me || me.id !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('members')
      .update({ bio })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase Bio Update Error:", error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Semblanza actualizada', data });
  } catch (err: any) {
    console.error("Bio update error:", err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
