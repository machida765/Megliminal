/** サーバー用データ入口。Cookie 付きと、トップ用（Cookie なし）を分ける。 */
import { SupabaseDataRepository } from '@/lib/data/supabase-repository';
import type { DataRepository } from '@/lib/data/types';
import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';

/** Server Component 用。cookie 付き server client を使う */
export async function getServerRepository(): Promise<DataRepository> {
  const client = await createClient();
  return new SupabaseDataRepository(() => client);
}

/** トップなど全員共通データ用。cookie を読まないので ISR できる */
export function getPublicRepository(): DataRepository {
  const client = createPublicClient();
  return new SupabaseDataRepository(() => client);
}
