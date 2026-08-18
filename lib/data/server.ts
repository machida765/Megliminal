import { getDataSource } from '@/lib/config/data-source';
import { localDataRepository } from '@/lib/data/local-repository';
import { SupabaseDataRepository } from '@/lib/data/supabase-repository';
import type { DataRepository } from '@/lib/data/types';
import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';

/** Server Component 用。Supabase は cookie 付き server client を使う */
export async function getServerRepository(): Promise<DataRepository> {
  if (getDataSource() === 'supabase') {
    const client = await createClient();
    return new SupabaseDataRepository(() => client);
  }
  return localDataRepository;
}

/** トップなど全員共通データ用。cookie を読まないので ISR できる */
export function getPublicRepository(): DataRepository {
  if (getDataSource() === 'supabase') {
    const client = createPublicClient();
    return new SupabaseDataRepository(() => client);
  }
  return localDataRepository;
}
