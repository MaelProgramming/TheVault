import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing. Database queries will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
