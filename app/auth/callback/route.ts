import { NextResponse } from 'next/server';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { getSafeRedirectPath } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

/** Google 等 OAuth 完了後、Supabase から code を受け取りセッションを確立 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = getSafeRedirectPath(next);
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(
    `${origin}${PUBLIC_BOARD ? '/' : '/login?error=auth_callback'}`
  );
}
