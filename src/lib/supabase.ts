import { createBrowserClient } from '@supabase/ssr';

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
rawUrl = rawUrl.replace(/\/+$/, '');

const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
  ? rawUrl 
  : 'https://dummy-project.supabase.co';

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'dummy-anon-key-placeholder';

if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  console.warn(
    'WARNING: Supabase URL or Anon Key is missing or invalid. Using dummy credentials for build stability. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
