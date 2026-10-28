import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wzrqfxbafhemwzhlnfnm.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cnFmeGJhZmhlbXd6aGxuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjQ2MzIsImV4cCI6MjEwODcwMDYzMn0.JYjYso13wmw_i4NiW2FnpSXs6q_DeIHZner_r_EWVS4';

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check demo user cookie first
  const isDemoUser = request.cookies.get('ai_finance_demo')?.value === 'true';

  // Do not run supabase.auth.getUser() if static or public asset
  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedPath = ['/dashboard', '/expenses', '/insights', '/settings'].some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If user is accessing protected route and not authenticated or in demo mode, redirect to login
  if (isProtectedPath && !user && !isDemoUser) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in (or in demo mode) and tries to visit login/signup, redirect to dashboard
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup';
  if (isAuthPage && (user || isDemoUser)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
