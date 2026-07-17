import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
  rawUrl = rawUrl.replace(/\/+$/, '');

  const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
    ? rawUrl 
    : 'https://dummy-project.supabase.co';
  
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'dummy-anon-key-placeholder';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
