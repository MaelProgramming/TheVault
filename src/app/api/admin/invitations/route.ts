import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';
import { checkIsFounder } from '@/lib/checkFounder';

export async function GET(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  const isFounder = await checkIsFounder(user.email);
  if (!isFounder) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*, creator:members!created_by(id, full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Error fetching admin invitations:', err);
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  const isFounder = await checkIsFounder(user.email);
  if (!isFounder) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    // 1. Get creator profile id
    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!me) {
      return NextResponse.json({ error: 'Perfil admin no encontrado' }, { status: 404 });
    }

    // 2. Generate random code
    const newCode = `VLT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

    // 3. Insert code
    const { data, error } = await supabase
      .from('invitations')
      .insert([
        {
          code: newCode,
          created_by: me.id,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('Error forging admin invitation:', err);
    return NextResponse.json({ error: 'Error al forjar la invitación' }, { status: 500 });
  }
}
