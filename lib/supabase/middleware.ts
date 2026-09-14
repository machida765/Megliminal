import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccessAdmin } from '@/lib/auth/admin-access';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}

function redirectHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
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

  if (PUBLIC_BOARD && pathname.startsWith('/profile')) {
    return redirectHome(request);
  }

  const loginRequiredPaths = PUBLIC_BOARD
    ? ['/profile/edit', '/settings', '/bookmarks']
    : ['/profile/edit', '/settings', '/bookmarks', '/reset-password'];
  const isLoginRequired = loginRequiredPaths.some((p) => pathname.startsWith(p));
  const isEditPost = /^\/post\/[^/]+\/edit/.test(pathname);
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminLoginPath = pathname === '/admin/login';

  if (
    !user &&
    (isLoginRequired || isEditPost || (isAdminPath && !isAdminLoginPath))
  ) {
    if (PUBLIC_BOARD && isAdminPath && !isAdminLoginPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return PUBLIC_BOARD
      ? redirectHome(request)
      : redirectToLogin(request, pathname);
  }

  if (isAdminPath && !isAdminLoginPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!canAccessAdmin(user.id, profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
