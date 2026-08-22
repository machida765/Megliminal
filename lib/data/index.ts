/** クライアント用データ入口。 */
import { supabaseDataRepository } from '@/lib/data/supabase-repository';
import type { DataRepository } from '@/lib/data/types';

export function getRepository(): DataRepository {
  return supabaseDataRepository;
}

export type {
  DataRepository,
  CreatePostInput,
  UpdatePostInput,
  HomePageData,
} from '@/lib/data/types';
