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
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Error fetching all members for admin:', err);
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}
