import { getDataSource } from '@/lib/config/data-source';
import { localDataRepository } from '@/lib/data/local-repository';
import { SupabaseDataRepository } from '@/lib/data/supabase-repository';
import type { DataRepository } from '@/lib/data/types';
import { createClient } from '@/lib/supabase/server';

/** Server Component 用。Supabase は cookie 付き server client を使う */
export async function getServerRepository(): Promise<DataRepository> {
  if (getDataSource() === 'supabase') {
    const client = await createClient();
    return new SupabaseDataRepository(() => client);
  }
  return localDataRepository;
}
