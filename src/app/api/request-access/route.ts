import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, institution, major, graduationYear, motivation } = await req.json();

    // 1. Fields validation
    if (!fullName || !email || !institution || !major || !graduationYear) {
      return NextResponse.json({ error: 'Tous les champs requis doivent être renseignés.' }, { status: 400 });
    }

    // 2. Insert request into Supabase table
    const { data, error } = await supabase
      .from('access_requests')
      .insert([
        {
          full_name: fullName,
          email: email.toLowerCase().trim(),
          institution: institution.trim(),
          major: major.trim(),
          graduation_year: parseInt(graduationYear),
          motivation: motivation ? motivation.trim() : '',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting access request to database:', error);
      return NextResponse.json({ error: 'Une erreur est survenue lors de l\'enregistrement de votre demande.' }, { status: 500 });
    }

    // 3. Send email notification if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    // On-sandbox Resend accounts can only send testing emails to their own verified email address.
    // If you verify your domain at resend.com/domains, you can add more founders here (e.g. 'maelgruand7@gmail.com')
    const founders = ['maelg396@gmail.com'];

    if (resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: 'Cormorant Garamond', 'Georgia', serif; background-color: #FDFBF7; padding: 40px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #C5A059;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #000000; letter-spacing: 0.25em; text-transform: uppercase; font-size: 24px; font-weight: normal; margin: 0;">The Vault</h1>
              <p style="color: #C5A059; letter-spacing: 0.15em; text-transform: uppercase; font-size: 10px; margin: 5px 0 0 0;">Cercle Universitaire d'Élite</p>
              <div style="width: 50px; height: 1px; background-color: #C5A059; margin: 20px auto 0 auto;"></div>
            </div>
            
            <h2 style="font-size: 18px; text-align: center; font-style: italic; margin-bottom: 30px; font-weight: normal; color: #C5A059;">
              Nouvelle Demande de Cooptation
            </h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA; font-weight: bold; width: 35%;">Candidat :</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA; font-weight: bold;">E-mail :</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA;"><a href="mailto:${email}" style="color: #C5A059; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA; font-weight: bold;">Institution :</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA;">${institution}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA; font-weight: bold;">Spécialisation :</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA;">${major}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA; font-weight: bold;">Promotion :</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E6E1DA;">${graduationYear}</td>
              </tr>
            </table>
            
            <div style="background-color: #F5F5DC; padding: 20px; border-left: 3px solid #C5A059; margin-bottom: 30px; font-size: 13px; line-height: 1.6; font-style: italic;">
              <p style="margin: 0; font-weight: bold; color: #000000; margin-bottom: 10px; font-style: normal; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">Lettre de Motivation :</p>
              "${motivation ? motivation.replace(/\n/g, '<br />') : 'Aucune lettre de motivation fournie.'}"
            </div>
            
            <div style="text-align: center; font-size: 11px; color: #706F6C; margin-top: 40px; border-top: 1px solid #E6E1DA; padding-top: 20px;">
              <p style="margin: 0; letter-spacing: 0.1em;">THE VAULT - SECURE GATEKEEPER</p>
              <p style="margin: 5px 0 0 0;">L'accès est un privilège, la discrétion un devoir.</p>
            </div>
          </div>
        `;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'The Vault Onboarding <onboarding@resend.dev>',
            to: founders,
            subject: `⚜ Demande d'accès : ${fullName} (${institution})`,
            html: emailHtml
          })
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error('Resend API returned an error:', errText);
        } else {
          console.log('Access request email sent successfully to founders.');
        }
      } catch (emailErr) {
        console.error('Failed to send email via Resend:', emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY is not defined. Email skip, entry saved in database.');
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Internal server error in request-access route:', err);
    return NextResponse.json({ error: 'Une erreur de protocole interne est survenue.' }, { status: 500 });
  }
}
