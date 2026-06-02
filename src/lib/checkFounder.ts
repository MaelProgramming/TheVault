import { supabase } from './supabase';

export async function checkIsFounder(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    const { data: me } = await supabase
      .from('members')
      .select('email, full_name')
      .eq('email', email)
      .single();

    if (!me) return false;

    return (
      me.email === 'maelg396@gmail.com' ||
      me.email === 'maelgruand7@gmail.com' ||
      me.full_name?.includes('Mael Gruand') ||
      me.full_name?.includes('Eliot')
    );
  } catch (error) {
    console.error('Error verifying Founder status:', error);
    return false;
  }
}
