import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/checkAuth';

// GET: Fetch members not yet swiped, sorted by Elite affinity score
export async function GET(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    // 1. Get current member profile
    const { data: me } = await supabase
      .from('members')
      .select('id, major, graduation_year, random_seed')
      .eq('email', user.email)
      .single();

    if (!me) {
      return NextResponse.json({ error: 'Ton profil n’existe pas' }, { status: 404 });
    }

    // 2. Fetch list of already swiped IDs
    const { data: swipedData } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', me.id);

    const alreadySwipedIds = swipedData?.map(s => s.swiped_id) || [];
    alreadySwipedIds.push(me.id);

    // 3. Retrieve candidates
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .not('id', 'in', `(${alreadySwipedIds.join(',')})`);

    if (error) throw error;

    // 4. Calculate Elite matching score
    const usersWithScore = data?.map((candidate: any) => {
      let score = 0;

      // Academic affinity
      if (candidate.major && me.major && candidate.major === me.major) {
        score += 45;
      }

      // Generational affinity
      if (candidate.graduation_year && me.graduation_year) {
        const diff = Math.abs(candidate.graduation_year - me.graduation_year);
        if (diff === 0) score += 35;
        else if (diff === 1) score += 15;
        else if (diff <= 3) score += 5;
      }

      // Alchemy random seed calculation
      const candidateSeed = candidate.random_seed || candidate.id?.charCodeAt(0) || 0;
      const mySeed = me.random_seed || me.id?.charCodeAt(0) || 0;
      score += (candidateSeed + mySeed) % 20;

      return {
        ...candidate,
        elite_score: Math.min(score, 99)
      };
    }) || [];

    // Sort to send top 20 matches
    const eliteMatches = usersWithScore
      .sort((a: any, b: any) => b.elite_score - a.elite_score)
      .slice(0, 20);

    return NextResponse.json(eliteMatches);
  } catch (err: any) {
    console.error('Error fetching members stack:', err);
    return NextResponse.json({ error: 'Impossible de charger la pile' }, { status: 500 });
  }
}

// POST: Create a member profile in Supabase after Firebase signup
export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Identificación requerida' }, { status: 401 });
  }

  try {
    const { full_name, name, gender, major, graduation_year, year } = await req.json();

    // Verify if profile already exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'El miembro ya existe' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('members')
      .insert([
        {
          email: user.email,
          full_name: full_name || name,
          sex: gender, // DB column is 'sex'
          major,
          graduation_year: graduation_year ? parseInt(graduation_year, 10) : (year ? parseInt(year, 10) : null),
          bio: '',
          avatar_url: '',
          is_verified: false,
          university: 'The Vault',
          random_seed: Math.floor(Math.random() * 100)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('Error creating member profile:', err);
    return NextResponse.json({ error: 'Erreur lors de la création del miembro' }, { status: 500 });
  }
}
