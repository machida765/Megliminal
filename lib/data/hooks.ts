'use client';

/** 画面用フック。TanStack Query によるキャッシュ管理。 */
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SHOW_COMMENTS, SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { getRepository } from '@/lib/data';
import type {
  Comment,
  MajorCategory,
  Post,
  PostRankingEntry,
  Profile,
  RankingPeriod,
  Report,
  SubCategory,
  Tag,
  User,
  UserRankingEntry,
  UserRankingSort,
} from '@/types';

/** 大ジャンル一覧（マスターデータのため Infinity キャッシュ） */
export function useMajorCategories(enabled = true) {
  const { data = [], isLoading, refetch } = useQuery<MajorCategory[]>({
    queryKey: ['majorCategories'],
    queryFn: () => getRepository().getMajorCategories(),
    enabled,
    staleTime: Infinity,
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { categories: data, loading: enabled ? isLoading : false, reload };
}

/** 中・小ジャンル一覧（マスターデータのため Infinity キャッシュ） */
export function useSubCategories(enabled = true) {
  const { data = [], isLoading, refetch } = useQuery<SubCategory[]>({
    queryKey: ['subCategories'],
    queryFn: () => getRepository().getSubCategories(),
    enabled,
    staleTime: Infinity,
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { subCategories: data, loading: enabled ? isLoading : false, reload };
}

/** タグ一覧（マスターデータのため Infinity キャッシュ） */
export function useTags(enabled = true) {
  const { data = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => getRepository().getTags(),
    enabled,
    staleTime: Infinity,
  });

  return { tags: data, loading: enabled ? isLoading : false };
}

/** 投稿一覧 */
export function usePosts(viewerUserId?: string | null) {
  const { data = [], isLoading, refetch } = useQuery<Post[]>({
    queryKey: ['posts', viewerUserId ?? null],
    queryFn: () => getRepository().getPosts(viewerUserId ?? undefined),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { posts: data, loading: isLoading, reload };
}

/** 投稿詳細 */
export function usePost(id: string, viewerUserId?: string | null) {
  const { data = null, isLoading, refetch } = useQuery<Post | null>({
    queryKey: ['post', id, viewerUserId ?? null],
    queryFn: () => (id ? getRepository().getPost(id, viewerUserId ?? undefined) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { post: data, loading: id ? isLoading : false, reload };
}

/** ユーザー情報 */
export function useUser(id: string | null | undefined) {
  const { data = null, isLoading } = useQuery<User | null>({
    queryKey: ['user', id ?? null],
    queryFn: () => (id ? getRepository().getUser(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  return { user: data, loading: id ? isLoading : false };
}

/** プロフィール情報 */
export function useProfile(id: string | null | undefined) {
  const { data = null, isLoading, refetch } = useQuery<Profile | null>({
    queryKey: ['profile', id ?? null],
    queryFn: () => (id ? getRepository().getProfile(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { profile: data, loading: id ? isLoading : false, reload };
}

/** ユーザー別投稿一覧 */
export function usePostsByUser(userId: string, viewerUserId?: string | null) {
  const { data = [], isLoading } = useQuery<Post[]>({
    queryKey: ['postsByUser', userId, viewerUserId ?? null],
    queryFn: () => (userId ? getRepository().getPostsByUser(userId, viewerUserId ?? undefined) : Promise.resolve([])),
    enabled: Boolean(userId),
  });

  return { posts: data, loading: userId ? isLoading : false };
}

/** 投稿へのコメント一覧 */
export function useComments(postId: string | null | undefined) {
  const { data = [], isLoading, refetch } = useQuery<Comment[]>({
    queryKey: ['comments', postId ?? null],
    queryFn: () => (postId ? getRepository().getComments(postId) : Promise.resolve([])),
    enabled: SHOW_COMMENTS && Boolean(postId),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { comments: data, loading: postId ? isLoading : false, reload };
}

/** ブックマーク投稿一覧 */
export function useBookmarks(userId: string | null | undefined) {
  const { data = [], isLoading, refetch } = useQuery<Post[]>({
    queryKey: ['bookmarks', userId ?? null],
    queryFn: () => (userId ? getRepository().getBookmarks(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { posts: data, loading: userId ? isLoading : false, reload };
}

/** 投稿ランキング */
export function usePostRankings(
  period: RankingPeriod,
  categoryId?: string
) {
  const { data = [], isLoading } = useQuery<PostRankingEntry[]>({
    queryKey: ['postRankings', period, categoryId ?? null],
    queryFn: () => getRepository().getPostRankings({ period, categoryId }),
  });

  return { entries: data, loading: isLoading };
}

/** ユーザーランキング */
export function useUserRankings(
  period: RankingPeriod,
  sortBy: UserRankingSort
) {
  const { data = [], isLoading } = useQuery<UserRankingEntry[]>({
    queryKey: ['userRankings', period, sortBy],
    queryFn: () => getRepository().getUserRankings({ period, sortBy }),
    enabled: SHOW_USER_IDENTITY,
  });

  return { entries: data, loading: isLoading };
}

/** 通報一覧 */
export function useReports(status?: Report['status']) {
  const { data = [], isLoading, refetch } = useQuery<Report[]>({
    queryKey: ['reports', status ?? 'all'],
    queryFn: () => getRepository().getReports(status),
  });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { reports: data, loading: isLoading, reload };
}

/** キャッシュ無効化（データ更新後に呼ぶ）用のカスタムフック */
export function useInvalidate() {
  const queryClient = useQueryClient();

  return useCallback(
    (...queryKeys: (string | unknown[])[]) => {
      queryKeys.forEach((key) => {
        const queryKey = typeof key === 'string' ? [key] : key;
        queryClient.invalidateQueries({ queryKey });
      });
    },
    [queryClient]
  );
}
