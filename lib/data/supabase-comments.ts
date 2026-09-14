import type { Comment, User } from '@/types';
import {
  ANONYMOUS_AUTHOR_ID,
  ANONYMOUS_AUTHOR_NAME,
} from '@/lib/auth/public-board';

/** Supabase comments 行 + 投稿者プロフィール */
export type SupabaseCommentRow = {
  id: string;
  post_id: string;
  user_id: string | null;
  body: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

export const COMMENT_SELECT = `
  id,
  post_id,
  user_id,
  body,
  created_at,
  profiles!comments_user_id_fkey ( id, name, avatar_url )
`;

export function mapSupabaseComment(row: SupabaseCommentRow): Comment {
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
    postId: row.post_id,
    userId: row.user_id,
    user,
    body: row.body,
    createdAt: row.created_at,
  };
}
