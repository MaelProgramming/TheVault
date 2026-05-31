import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Código no proporcionado' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Llave inválida o ya utilizada' }, { status: 404 });
    }

    return NextResponse.json({ valid: true, id: data.id });
  } catch (err: any) {
    console.error("Error verifying invitation code:", err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
