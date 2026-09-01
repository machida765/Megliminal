import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRole } from '@/lib/auth/roles';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const loginRequiredPaths = ['/create', '/profile/edit', '/settings', '/bookmarks', '/reset-password'];
  const isLoginRequired = loginRequiredPaths.some((p) => pathname.startsWith(p));
  const isEditPost = /^\/post\/[^/]+\/edit/.test(pathname);
  const isAdminPath = pathname.startsWith('/admin');

  if (!user && (isLoginRequired || isEditPost || isAdminPath)) {
    return redirectToLogin(request, pathname);
  }

  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!isAdminRole(profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
