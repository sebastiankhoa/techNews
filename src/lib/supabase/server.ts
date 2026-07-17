import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
  rawUrl = rawUrl.replace(/\/+$/, '');

  const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
    ? rawUrl 
    : 'https://dummy-project.supabase.co';
  
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'dummy-anon-key-placeholder';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
