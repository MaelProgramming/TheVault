import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';
import { checkIsFounder } from '@/lib/checkFounder';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  const isFounder = await checkIsFounder(user.email);
  if (!isFounder) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { is_verified } = await req.json();

    const { data, error } = await supabase
      .from('members')
      .update({
        is_verified,
        verified_at: is_verified ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error updating member verification:', err);
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  const isFounder = await checkIsFounder(user.email);
  if (!isFounder) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Delete the member profile
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Miembro retirado con éxito' });
  } catch (err: any) {
    console.error('Error deleting member profile:', err);
    return NextResponse.json({ error: 'Error al retirar el miembro' }, { status: 500 });
  }
}
