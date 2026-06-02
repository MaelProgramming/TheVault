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
    const { status } = await req.json(); // status: 'active' | 'revoked' | etc.

    const { data, error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error updating invitation status:', err);
    return NextResponse.json({ error: 'Error al actualizar la invitación' }, { status: 500 });
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
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Invitación eliminada' });
  } catch (err: any) {
    console.error('Error deleting invitation:', err);
    return NextResponse.json({ error: 'Error al eliminar la invitación' }, { status: 500 });
  }
}
