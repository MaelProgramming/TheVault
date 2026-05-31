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
      return NextResponse.json({ error: 'Miembro no reconocido' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('created_by', me.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Error fetching invitations:', err);
    return NextResponse.json({ error: 'Error al consultar el cofre' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { data: me } = await supabase
      .from('members')
      .select('id, full_name, email')
      .eq('email', user.email)
      .single();

    if (!me) {
      return NextResponse.json({ error: 'Miembro no reconocido' }, { status: 404 });
    }

    const isFounder = me.email === 'maelg396@gmail.com' || 
                      me.email === 'maelgruand7@gmail.com' || 
                      me.full_name?.includes('Mael Gruand') || 
                      me.full_name?.includes('Eliot');

    if (!isFounder) {
      // Limit to 3 invitations
      const { count, error: countError } = await supabase
        .from('invitations')
        .select('id', { count: 'exact' })
        .eq('created_by', me.id);

      if (countError) throw countError;

      if (count !== null && count >= 3) {
        return NextResponse.json({ error: 'Límite de sellos (3/3) alcanzado' }, { status: 400 });
      }
    }

    const newCode = `VLT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

    const { data, error } = await supabase
      .from('invitations')
      .insert([{ code: newCode, created_by: me.id, status: 'active' }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('Error generating invitation:', err);
    return NextResponse.json({ error: 'Error al forjar la invitación' }, { status: 500 });
  }
}
