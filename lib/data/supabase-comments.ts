import type { Comment, User } from '@/types';

/** Supabase comments 行 + 投稿者プロフィール */
export type SupabaseCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
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
  const user: User = {
    id: profile?.id ?? row.user_id,
    name: profile?.name ?? 'Unknown',
    avatarUrl: profile?.avatar_url ?? undefined,
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
