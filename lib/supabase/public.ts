import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

/** ログイン情報を見ない公開用クライアント。トップのキャッシュ用 */
export function createPublicClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey);
}
