import { createClient } from '@supabase/supabase-js';

/** ログイン情報を見ない公開用クライアント。トップのキャッシュ用 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が必要です'
    );
  }

  return createClient(url, anonKey);
}
