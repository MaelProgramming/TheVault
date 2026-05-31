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
    // 1. Get file from FormData
    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier envoyé' }, { status: 400 });
    }

    // Check mime type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé. Uniquement JPG, PNG, WEBP.' }, { status: 400 });
    }

    // 2. Safety check: make sure user is updating their own profile
    const { data: me } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!me || me.id !== id) {
      console.warn(`[SECURITY WARNING] User ${me?.id || user.email} tried to update avatar of user ${id}`);
      return NextResponse.json({ error: 'Accès refusé. Vous ne pouvez modifier que votre propre avatar.' }, { status: 403 });
    }

    // 3. Fetch old avatar path to delete it
    const { data: memberData } = await supabase
      .from('members')
      .select('avatar_url')
      .eq('id', id)
      .single();

    let oldpath: string | null = null;
    if (memberData?.avatar_url) {
      try {
        const urlObj = new URL(memberData.avatar_url);
        const match = urlObj.pathname.match(/\/sign\/avatars\/(.+)/);
        if (match && match[1]) {
          oldpath = match[1];
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (oldpath) {
      await supabase.storage.from('avatars').remove([oldpath]);
    }

    // 4. Read file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/${id}-${Date.now()}.${fileExtension}`;
    const tenY: number = 315360000; // 10 years in seconds

    // 5. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 6. Generate signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, tenY);

    if (signedError) throw signedError;

    const signedUrl = signedData.signedUrl;

    // 7. Update database
    const { error: dbError } = await supabase
      .from('members')
      .update({ avatar_url: signedUrl })
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({
      message: 'Avatar mis à jour avec classe',
      url: signedUrl
    });
  } catch (err: any) {
    console.error("Avatar upload crash:", err);
    return NextResponse.json({ error: 'Erreur lors de l’upload de l’image' }, { status: 500 });
  }
}
