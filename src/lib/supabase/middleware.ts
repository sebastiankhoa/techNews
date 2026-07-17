import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
  rawUrl = rawUrl.replace(/\/+$/, '');

  const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
    ? rawUrl 
    : 'https://dummy-project.supabase.co';
  
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'dummy-anon-key-placeholder';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // and Route Handlers to get the logged in user correctly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !isLoginPage) {
    if (!user) {
      // User is not logged in, redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // User is logged in, now check if they are in the admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !adminUser) {
      // User is not an admin, sign them out and redirect to login
      await supabase.auth.signOut();
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is logged in, is an admin, and tries to access /admin/login, redirect to /admin
  if (user && isLoginPage) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (adminUser) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return supabaseResponse;
}
