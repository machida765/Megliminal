import { getDataSource } from '@/lib/config/data-source';
import { localDataRepository } from '@/lib/data/local-repository';
import { supabaseDataRepository } from '@/lib/data/supabase-repository';
import type { DataRepository } from '@/lib/data/types';

export function getRepository(): DataRepository {
  return getDataSource() === 'supabase'
    ? supabaseDataRepository
    : localDataRepository;
}

export type {
  DataRepository,
  CreatePostInput,
  UpdatePostInput,
  HomePageData,
} from '@/lib/data/types';
export { localStore } from '@/lib/data/local-store';
