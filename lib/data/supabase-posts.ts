import type { Post, User } from '@/types';
import {
  ANONYMOUS_AUTHOR_ID,
  ANONYMOUS_AUTHOR_NAME,
} from '@/lib/auth/public-board';

/** Supabase posts 行 + リレーション */
export type SupabasePostRow = {
  id: string;
  user_id: string | null;
  major_category_id: string;
  sub_category_id: string | null;
  title: string;
  description: string;
  url: string | null;
  like_count: number;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  post_tags: { tag_id: string }[] | null;
};

export const POST_SELECT = `
  id,
  user_id,
  major_category_id,
  sub_category_id,
  title,
  description,
  url,
  like_count,
  created_at,
  profiles!posts_user_id_fkey ( id, name, avatar_url ),
  post_tags ( tag_id )
`;

export function mapSupabasePost(row: SupabasePostRow): Post {
  const profile = row.profiles;
  const user: User = row.user_id
    ? {
        id: profile?.id ?? row.user_id,
        name: profile?.name ?? 'Unknown',
        avatarUrl: profile?.avatar_url ?? undefined,
      }
    : {
        id: ANONYMOUS_AUTHOR_ID,
        name: ANONYMOUS_AUTHOR_NAME,
      };

  return {
    id: row.id,
    userId: row.user_id,
    user,
    majorCategoryId: row.major_category_id,
    subCategoryId: row.sub_category_id,
    tagIds: (row.post_tags ?? []).map((t) => t.tag_id),
    title: row.title,
    description: row.description,
    url: row.url ?? undefined,
    createdAt: row.created_at,
    likeCount: row.like_count,
  };
}
