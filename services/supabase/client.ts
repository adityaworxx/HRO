import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijcesduxnbgxjcteejbk.supabase.co';
const supabaseAnonKey =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ezpArMfQi-1GiA5upxOPsA_-d8hzIAN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
