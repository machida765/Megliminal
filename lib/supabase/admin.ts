import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceEnv } from '@/lib/supabase/service-env';

/** サーバー専用 Admin クライアント（退会など auth.admin 操作） */
export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
