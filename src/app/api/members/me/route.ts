import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}
