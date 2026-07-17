import { createClient } from '@supabase/supabase-js';

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
rawUrl = rawUrl.replace(/\/+$/, '');

const supabaseUrl = rawUrl;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

const isValidUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://dummy-project.supabase.co';
const finalKey = supabaseAnonKey || 'dummy-anon-key-placeholder';

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn(
    'WARNING: Supabase URL or Anon Key is missing or invalid. Using dummy credentials for build stability. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = createClient(finalUrl, finalKey);
