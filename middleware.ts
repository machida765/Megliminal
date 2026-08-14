import { type NextRequest, NextResponse } from 'next/server';
import { isSupabaseDataSource } from '@/lib/config/data-source';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // ローカルデータモードでは認証リダイレクトしない（画面開発優先）
  if (!isSupabaseDataSource()) {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
