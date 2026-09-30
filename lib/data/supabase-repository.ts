import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/public';
import type { SupabaseClient } from '@supabase/supabase-js';
import { canAccessAdmin } from '@/lib/auth/admin-access';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { checkPostFrequency } from '@/lib/post-frequency';
import { getPeriodStart } from '@/lib/ranking';
import type {
  CreatePostInput,
  DataRepository,
  HomePageData,
  PostRankingOptions,
  UpdatePostInput,
  UserRankingOptions,
} from '@/lib/data/types';
import {
  mapSupabasePost,
  POST_SELECT,
  type SupabasePostRow,
} from '@/lib/data/supabase-posts';
import {
  COMMENT_SELECT,
  mapSupabaseComment,
  type SupabaseCommentRow,
} from '@/lib/data/supabase-comments';
import {
  categoryIdSchema,
  commentBodySchema,
  commentIdSchema,
  createPostSchema,
  majorCategorySchema,
  postIdSchema,
  reportDetailSchema,
  reportReasonSchema,
  updatePostSchema,
  updateProfileSchema,
  userIdSchema,
} from '@/lib/validation/data';
import type {
  Bookmark,
  Comment,
  Like,
  MajorCategory,
  Post,
  PostRankingEntry,
  Profile,
  RankingPeriod,
  Report,
  ReportReason,
  SubCategory,
  User,
  UserRankingEntry,
} from '@/types';

type SupabaseReportRow = {
  id: string;
  post_id: string;
  reporter_id: string | null;
  reporter_key: string | null;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
};

type MajorCategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  color_from: string | null;
  color_to: string | null;
  color_accent: string | null;
  sort_order: number;
  is_active: boolean;
};

function mapMajorCategoryRow(row: MajorCategoryRow): MajorCategory {
  const palette =
    row.color_from && row.color_to && row.color_accent
      ? { from: row.color_from, to: row.color_to, accent: row.color_accent }
      : undefined;

  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? undefined,
    palette,
    order: row.sort_order,
    isActive: row.is_active,
  };
}

function mapReportRow(row: SupabaseReportRow): Report {
  return {
    id: row.id,
    postId: row.post_id,
    reporterId: row.reporter_id ?? undefined,
    reporterKey: row.reporter_key ?? undefined,
    reason: row.reason as ReportReason,
    detail: row.detail ?? undefined,
    createdAt: row.created_at,
    status: row.status as Report['status'],
  };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

function submittedReport(input: {
  postId: string;
  reason: ReportReason;
  detail: string | null;
  reporterId?: string;
  reporterKey?: string;
}): Report {
  return {
    id: 'submitted',
    postId: input.postId,
    reporterId: input.reporterId,
    reporterKey: input.reporterKey,
    reason: input.reason,
    detail: input.detail ?? undefined,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostsSelectQuery = any;

/** Supabase 実装 */
export class SupabaseDataRepository implements DataRepository {
  constructor(
    private readonly clientFactory: () => SupabaseClient = createClient
  ) {}

  private get client() {
    return this.clientFactory();
  }

  private async getAuthenticatedUserId(): Promise<string> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    if (error || !user) {
      throw new Error('認証が必要です。');
    }

    return user.id;
  }

  private async assertActingAs(userId: string): Promise<void> {
    const validatedUserId = userIdSchema.parse(userId);
    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (validatedUserId !== authenticatedUserId) {
      throw new Error('他のユーザーとして操作することはできません。');
    }
  }

  /** ログイン中は本人確認。掲示板モードでは未ログインの匿名書き込みを許可する。 */
  private async assertCanWriteAs(userId: string | null | undefined): Promise<string | null> {
    if (userId) {
      await this.assertActingAs(userId);
      return userId;
    }
    if (!PUBLIC_BOARD) {
      throw new Error('認証が必要です。');
    }
    return null;
  }

  private async assertIsAdmin(): Promise<void> {
    const userId = await this.getAuthenticatedUserId();
    const { data: profile, error } = await this.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !canAccessAdmin(userId, profile?.role)) {
      throw new Error('管理者権限が必要です。');
    }
  }

  private async assertCanChangePosts(
    ids: string[],
    allowAdmin = false
  ): Promise<string[]> {
    const validatedIds = ids.map((id) => postIdSchema.parse(id));
    const uniqueIds = [...new Set(validatedIds)];
    const authenticatedUserId = await this.getAuthenticatedUserId();
    const { data, error } = await this.client
      .from('posts')
      .select('id, user_id')
      .in('id', uniqueIds);

    if (error || !data || data.length !== uniqueIds.length) {
      throw error ?? new Error('対象の投稿が見つかりません。');
    }

    if (data.every((post) => post.user_id === authenticatedUserId)) {
      return uniqueIds;
    }

    if (allowAdmin) {
      const { data: profile, error: profileError } = await this.client
        .from('profiles')
        .select('role')
        .eq('id', authenticatedUserId)
        .single();

      if (!profileError && profile?.role === 'admin') {
        return uniqueIds;
      }
    }

    throw new Error('この投稿を変更する権限がありません。');
  }

  private async getHiddenPostIds(viewerUserId?: string): Promise<Set<string>> {
    if (!viewerUserId) return new Set();

    const { data, error } = await this.client
      .from('hidden_posts')
      .select('post_id')
      .eq('user_id', viewerUserId);

    if (error) {
      console.warn('[supabase] getHiddenPostIds:', error.message);
      return new Set();
    }

    return new Set((data ?? []).map((row) => row.post_id as string));
  }

  private filterHidden(posts: Post[], hiddenIds: Set<string>): Post[] {
    if (hiddenIds.size === 0) return posts;
    return posts.filter((p) => !hiddenIds.has(p.id));
  }

  private async fetchPosts(
    applyFilter?: (query: PostsSelectQuery) => PostsSelectQuery
  ): Promise<Post[]> {
    let query: PostsSelectQuery = this.client.from('posts').select(POST_SELECT);

    if (applyFilter) {
      query = applyFilter(query);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[supabase] fetchPosts:', error.message);
      return [];
    }

    return (data as unknown as SupabasePostRow[]).map(mapSupabasePost);
  }

  private async syncPostTags(postId: string, tagIds: string[]) {
    await this.client.from('post_tags').delete().eq('post_id', postId);

    if (tagIds.length === 0) return;

    const { error } = await this.client.from('post_tags').insert(
      tagIds.map((tag_id) => ({ post_id: postId, tag_id }))
    );

    if (error) {
      console.warn('[supabase] syncPostTags:', error.message);
    }
  }

  async getMajorCategories(): Promise<MajorCategory[]> {
    const { data, error } = await this.client
      .from('major_categories')
      .select('id, name, icon, color_from, color_to, color_accent, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getMajorCategories:', error.message);
      return [];
    }

    return (data ?? []).map((row) => mapMajorCategoryRow(row));
  }

  async getSubCategories(): Promise<SubCategory[]> {
    const { data, error } = await this.client
      .from('sub_categories')
      .select('id, major_category_id, name, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getSubCategories:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      majorCategoryId: row.major_category_id,
      name: row.name,
      order: row.sort_order,
      isActive: row.is_active,
    }));
  }

  async getTags() {
    const { data, error } = await this.client
      .from('tags')
      .select('id, name, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getTags:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      order: row.sort_order,
      isActive: row.is_active,
    }));
  }

  private async fetchHomeStats(): Promise<HomePageData['stats']> {
    const { count: postCount, error: countError } = await this.client
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('[supabase] fetchHomeStats count:', countError.message);
      return { postCount: 0, likeCount: 0, userCount: 0 };
    }

    const { data, error } = await this.client
      .from('posts')
      .select('like_count, user_id');

    if (error) {
      console.warn('[supabase] fetchHomeStats:', error.message);
      return { postCount: postCount ?? 0, likeCount: 0, userCount: 0 };
    }

    const rows = data ?? [];
    const likeCount = rows.reduce((sum, row) => sum + row.like_count, 0);
    const userCount = new Set(rows.map((row) => row.user_id)).size;

    return {
      postCount: postCount ?? rows.length,
      likeCount,
      userCount,
    };
  }

  async getHomePageData(): Promise<HomePageData> {
    console.log(
      '🔥 [DB FETCH] getHomePageData: Supabase DBからトップ用データを全件取得中...',
      new Date().toLocaleTimeString()
    );
    const [
      categories,
      subCategories,
      tags,
      recentPosts,
      popularPosts,
      heroCandidates,
      rankingEntries,
      stats,
    ] = await Promise.all([
      this.getMajorCategories(),
      this.getSubCategories(),
      this.getTags(),
      this.fetchPosts((q) =>
        q.order('created_at', { ascending: false }).limit(8)
      ),
      this.fetchPosts((q) =>
        q.order('like_count', { ascending: false }).limit(6)
      ),
      this.fetchPosts((q) =>
        q
          .gt('like_count', 10)
          .order('like_count', { ascending: false })
          .limit(10)
      ),
      this.getPostRankings({ period: 'week', limit: 5 }),
      this.fetchHomeStats(),
    ]);

    return {
      recentPosts,
      popularPosts,
      rankingEntries,
      heroCandidates,
      stats,
      categories,
      subCategories,
      tags,
    };
  }

  async getPosts(viewerUserId?: string): Promise<Post[]> {
    const hiddenIds = await this.getHiddenPostIds(viewerUserId);
    const posts = await this.fetchPosts();
    return this.filterHidden(posts, hiddenIds);
  }

  async getPost(id: string, viewerUserId?: string): Promise<Post | null> {
    const hiddenIds = await this.getHiddenPostIds(viewerUserId);
    if (hiddenIds.has(id)) return null;

    const { data, error } = await this.client
      .from('posts')
      .select(POST_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('[supabase] getPost:', error.message);
      return null;
    }

    if (!data) return null;
    return mapSupabasePost(data as unknown as SupabasePostRow);
  }

  async getPostsByUser(userId: string, viewerUserId?: string): Promise<Post[]> {
    const hiddenIds = await this.getHiddenPostIds(viewerUserId);
    const posts = await this.fetchPosts((q) => q.eq('user_id', userId));
    return this.filterHidden(posts, hiddenIds);
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url ?? undefined,
    };
  }

  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, name, avatar_url, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url ?? undefined,
      role: data.role as Profile['role'],
      createdAt: data.created_at,
    };
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const validated = createPostSchema.parse(input);
    const userId = await this.assertCanWriteAs(validated.userId);

    const { data, error } = await this.client
      .from('posts')
      .insert({
        user_id: userId,
        major_category_id: validated.majorCategoryId,
        sub_category_id: validated.subCategoryId ?? null,
        title: validated.title,
        description: validated.description,
        url: validated.url ?? null,
      })
      .select(POST_SELECT)
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to create post');
    }

    const tagIds = validated.tagIds ?? [];
    if (tagIds.length > 0) {
      await this.syncPostTags(data.id, tagIds);
      const created = await this.getPost(data.id);
      if (created) return created;
    }

    return mapSupabasePost(data as unknown as SupabasePostRow);
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const [validatedId] = await this.assertCanChangePosts([id]);
    const validated = updatePostSchema.parse(input);
    const payload: Record<string, unknown> = {};
    if (validated.majorCategoryId !== undefined) {
      payload.major_category_id = validated.majorCategoryId;
    }
    if (validated.subCategoryId !== undefined) {
      payload.sub_category_id = validated.subCategoryId;
    }
    if (validated.title !== undefined) payload.title = validated.title;
    if (validated.description !== undefined) {
      payload.description = validated.description;
    }
    if (validated.url !== undefined) payload.url = validated.url;

    const { error } = await this.client
      .from('posts')
      .update(payload)
      .eq('id', validatedId);

    if (error) throw error;

    if (validated.tagIds !== undefined) {
      await this.syncPostTags(validatedId, validated.tagIds);
    }

    const updated = await this.getPost(validatedId);
    if (!updated) throw new Error('Post not found after update');
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await this.deletePosts([id]);
  }

  async deletePosts(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.assertIsAdmin();
    const validatedIds = [...new Set(ids.map((id) => postIdSchema.parse(id)))];

    const { error } = await this.client
      .from('posts')
      .delete()
      .in('id', validatedIds);
    if (error) throw error;
  }

  async checkPostFrequency(userId: string, majorCategoryId: string) {
    const posts = await this.fetchPosts((q) =>
      q.eq('user_id', userId).eq('major_category_id', majorCategoryId)
    );
    return checkPostFrequency(posts, userId, majorCategoryId);
  }

  async updateUser(id: string, data: Partial<Pick<User, 'name' | 'avatarUrl'>>) {
    const validatedId = userIdSchema.parse(id);
    await this.assertActingAs(validatedId);
    const validated = updateProfileSchema.parse(data);
    const { data: updated, error } = await this.client
      .from('profiles')
      .update({
        name: validated.name,
        avatar_url: validated.avatarUrl,
      })
      .eq('id', validatedId)
      .select('id, name, avatar_url')
      .single();

    if (error || !updated) throw error ?? new Error('Update failed');

    return {
      id: updated.id,
      name: updated.name,
      avatarUrl: updated.avatar_url ?? undefined,
    };
  }

  async upsertMajorCategory(category: MajorCategory): Promise<MajorCategory> {
    const validated = majorCategorySchema.parse(category);

    const { data, error } = await this.client
      .from('major_categories')
      .upsert({
        id: validated.id,
        name: validated.name,
        icon: validated.icon ?? null,
        color_from: validated.palette?.from ?? null,
        color_to: validated.palette?.to ?? null,
        color_accent: validated.palette?.accent ?? null,
        sort_order: validated.order,
        is_active: validated.isActive,
      })
      .select('id, name, icon, color_from, color_to, color_accent, sort_order, is_active')
      .single();

    if (error || !data) throw error ?? new Error('カテゴリの保存に失敗しました。');

    return mapMajorCategoryRow(data);
  }

  async deleteMajorCategory(id: string): Promise<void> {
    const validatedId = categoryIdSchema.parse(id);

    const { count, error: usageError } = await this.client
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('major_category_id', validatedId);

    if (usageError) throw usageError;
    if ((count ?? 0) > 0) {
      throw new Error('この大カテゴリには投稿があるため削除できません。');
    }

    const { error } = await this.client
      .from('major_categories')
      .delete()
      .eq('id', validatedId);

    if (error) throw error;
  }

  async reorderMajorCategories(ids: string[]): Promise<MajorCategory[]> {
    const validatedIds = ids.map((id) => categoryIdSchema.parse(id));

    const { data: existing, error: fetchError } = await this.client
      .from('major_categories')
      .select('id, name, icon, color_from, color_to, color_accent, is_active')
      .in('id', validatedIds);

    if (fetchError) throw fetchError;
    if (!existing || existing.length !== validatedIds.length) {
      throw new Error('並び替え対象のカテゴリが見つかりません。');
    }

    const byId = new Map(existing.map((row) => [row.id, row]));
    const payload = validatedIds.map((id, index) => {
      const row = byId.get(id)!;
      return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        color_from: row.color_from,
        color_to: row.color_to,
        color_accent: row.color_accent,
        is_active: row.is_active,
        sort_order: index,
      };
    });

    const { error } = await this.client.from('major_categories').upsert(payload);
    if (error) throw error;

    return this.getMajorCategories();
  }

  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await this.client
      .from('comments')
      .select(COMMENT_SELECT)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[supabase] getComments:', error.message);
      return [];
    }

    return (data ?? []).map((row) => mapSupabaseComment(row as unknown as SupabaseCommentRow));
  }

  async addComment(userId: string | null, postId: string, body: string): Promise<Comment> {
    const actingUserId = await this.assertCanWriteAs(userId);
    const validatedPostId = postIdSchema.parse(postId);
    const validatedBody = commentBodySchema.parse(body);

    const { data, error } = await this.client
      .from('comments')
      .insert({
        user_id: actingUserId,
        post_id: validatedPostId,
        body: validatedBody,
      })
      .select(COMMENT_SELECT)
      .single();

    if (error || !data) throw error ?? new Error('コメントの投稿に失敗しました。');

    return mapSupabaseComment(data as unknown as SupabaseCommentRow);
  }

  async updateComment(commentId: string, body: string): Promise<Comment> {
    const validatedId = commentIdSchema.parse(commentId);
    const validatedBody = commentBodySchema.parse(body);
    const authenticatedUserId = await this.getAuthenticatedUserId();

    const { data, error } = await this.client
      .from('comments')
      .update({ body: validatedBody })
      .eq('id', validatedId)
      .eq('user_id', authenticatedUserId)
      .select(COMMENT_SELECT)
      .single();

    if (error || !data) {
      throw error ?? new Error('このコメントを編集する権限がありません。');
    }

    return mapSupabaseComment(data as unknown as SupabaseCommentRow);
  }

  async deleteComment(commentId: string): Promise<void> {
    const validatedId = commentIdSchema.parse(commentId);
    await this.getAuthenticatedUserId();

    // 本人以外は RLS が拒否する。admin は comments_delete_admin で許可される。
    const { error } = await this.client
      .from('comments')
      .delete()
      .eq('id', validatedId);

    if (error) throw error;
  }

  async getLikes(postId?: string): Promise<Like[]> {
    let query = this.client
      .from('likes')
      .select('id, post_id, user_id, created_at');

    if (postId) {
      query = query.eq('post_id', postId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[supabase] getLikes:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
    }));
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) return false;
    return Boolean(data);
  }

  async getLikedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('likes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('[supabase] getLikedPostIds:', error.message);
      return [];
    }

    return (data ?? []).map((row) => row.post_id as string);
  }

  async addLike(userId: string | null, postId: string): Promise<Like> {
    const actingUserId = await this.assertCanWriteAs(userId);
    const validatedPostId = postIdSchema.parse(postId);
    const payload = { user_id: actingUserId, post_id: validatedPostId };

    const { data, error } = actingUserId
      ? await this.client
          .from('likes')
          .upsert(payload, { onConflict: 'post_id,user_id', ignoreDuplicates: true })
          .select('id, post_id, user_id, created_at')
          .maybeSingle()
      : await this.client
          .from('likes')
          .insert(payload)
          .select('id, post_id, user_id, created_at')
          .single();

    if (error) throw error;

    if (data) {
      return {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        createdAt: data.created_at,
      };
    }

    const { data: existing, error: existingError } = await this.client
      .from('likes')
      .select('id, post_id, user_id, created_at')
      .eq('user_id', actingUserId)
      .eq('post_id', validatedPostId)
      .single();

    if (existingError || !existing) {
      throw existingError ?? new Error('いいねに失敗しました。');
    }

    return {
      id: existing.id,
      postId: existing.post_id,
      userId: existing.user_id,
      createdAt: existing.created_at,
    };
  }

  async removeLike(userId: string, postId: string): Promise<void> {
    await this.assertActingAs(userId);
    const validatedPostId = postIdSchema.parse(postId);

    const { error } = await this.client
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', validatedPostId);

    if (error) throw error;
  }

  /** 期間内のいいねを post_id ごとに数える。period='all' は null を返す。 */
  private async countLikesSince(
    period: RankingPeriod
  ): Promise<Map<string, number> | null> {
    const since = getPeriodStart(period);
    if (!since) return null;

    const { data, error } = await this.client
      .from('likes')
      .select('post_id')
      .gte('created_at', since.toISOString());

    if (error) {
      console.warn('[supabase] countLikesSince:', error.message);
      return new Map();
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const postId = row.post_id as string;
      counts.set(postId, (counts.get(postId) ?? 0) + 1);
    }
    return counts;
  }

  async getPostRankings(options: PostRankingOptions): Promise<PostRankingEntry[]> {
    const { period, categoryId, limit = 20 } = options;
    const counts = await this.countLikesSince(period);

    // 全期間は posts.like_count がトリガーで同期済みなので DB 側で並べる
    if (!counts) {
      const posts = await this.fetchPosts((q) => {
        let query = q
          .gt('like_count', 0)
          .order('like_count', { ascending: false })
          .limit(limit);
        if (categoryId) query = query.eq('major_category_id', categoryId);
        return query;
      });

      return posts.map((post, index) => ({
        rank: index + 1,
        post,
        likeCount: post.likeCount,
      }));
    }

    const rankedIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([postId]) => postId);

    if (rankedIds.length === 0) return [];

    // カテゴリ絞り込みで件数が減るぶん、多めに取ってから切り詰める
    const candidateIds = rankedIds.slice(0, Math.max(limit * 3, limit));
    const posts = await this.fetchPosts((q) => {
      let query = q.in('id', candidateIds);
      if (categoryId) query = query.eq('major_category_id', categoryId);
      return query;
    });

    return posts
      .map((post) => ({ post, likeCount: counts.get(post.id) ?? 0 }))
      .filter((item) => item.likeCount > 0)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        post: item.post,
        likeCount: item.likeCount,
      }));
  }

  async getUserRankings(options: UserRankingOptions): Promise<UserRankingEntry[]> {
    const { period, sortBy, limit = 20 } = options;
    const since = getPeriodStart(period);

    const valueByUserId = new Map<string, number>();

    if (sortBy === 'posts') {
      let query = this.client.from('posts').select('user_id');
      if (since) query = query.gte('created_at', since.toISOString());

      const { data, error } = await query;
      if (error) {
        console.warn('[supabase] getUserRankings posts:', error.message);
        return [];
      }

      for (const row of data ?? []) {
        const userId = row.user_id as string | null;
        if (!userId) continue;
        valueByUserId.set(userId, (valueByUserId.get(userId) ?? 0) + 1);
      }
    } else {
      const { data: postRows, error: postError } = await this.client
        .from('posts')
        .select('id, user_id');

      if (postError) {
        console.warn('[supabase] getUserRankings posts:', postError.message);
        return [];
      }

      const authorByPostId = new Map(
        (postRows ?? [])
          .filter((row) => Boolean(row.user_id))
          .map((row) => [row.id as string, row.user_id as string])
      );

      let likeQuery = this.client.from('likes').select('post_id');
      if (since) likeQuery = likeQuery.gte('created_at', since.toISOString());

      const { data: likeRows, error: likeError } = await likeQuery;
      if (likeError) {
        console.warn('[supabase] getUserRankings likes:', likeError.message);
        return [];
      }

      for (const row of likeRows ?? []) {
        const authorId = authorByPostId.get(row.post_id as string);
        if (!authorId) continue;
        valueByUserId.set(authorId, (valueByUserId.get(authorId) ?? 0) + 1);
      }
    }

    const rankedIds = [...valueByUserId.entries()]
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);

    if (rankedIds.length === 0) return [];

    const { data: profileRows, error: profileError } = await this.client
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', rankedIds);

    if (profileError) {
      console.warn('[supabase] getUserRankings profiles:', profileError.message);
      return [];
    }

    const userById = new Map<string, User>(
      (profileRows ?? []).map((row) => [
        row.id as string,
        {
          id: row.id as string,
          name: row.name as string,
          avatarUrl: (row.avatar_url as string | null) ?? undefined,
        },
      ])
    );

    return rankedIds
      .map((userId) => userById.get(userId))
      .filter((user): user is User => Boolean(user))
      .map((user, index) => ({
        rank: index + 1,
        user,
        value: valueByUserId.get(user.id) ?? 0,
      }));
  }

  async getBookmarks(userId: string): Promise<Post[]> {
    const validatedUserId = userIdSchema.parse(userId);

    const { data, error } = await this.client
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', validatedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[supabase] getBookmarks:', error.message);
      return [];
    }

    const postIds = (data ?? []).map((row) => row.post_id as string);
    if (postIds.length === 0) return [];

    const posts = await this.fetchPosts((q) => q.in('id', postIds));
    const orderByPostId = new Map(postIds.map((id, index) => [id, index]));

    return posts.sort(
      (a, b) =>
        (orderByPostId.get(a.id) ?? 0) - (orderByPostId.get(b.id) ?? 0)
    );
  }

  async isBookmarked(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) return false;
    return Boolean(data);
  }

  async addBookmark(userId: string, postId: string): Promise<Bookmark> {
    await this.assertActingAs(userId);
    const validatedPostId = postIdSchema.parse(postId);

    const { error } = await this.client
      .from('bookmarks')
      .upsert(
        { user_id: userId, post_id: validatedPostId },
        { onConflict: 'user_id,post_id', ignoreDuplicates: true }
      );

    if (error) throw error;

    const { data, error: fetchError } = await this.client
      .from('bookmarks')
      .select('id, user_id, post_id, created_at')
      .eq('user_id', userId)
      .eq('post_id', validatedPostId)
      .single();

    if (fetchError || !data) {
      throw fetchError ?? new Error('保存に失敗しました。');
    }

    return {
      id: data.id,
      userId: data.user_id,
      postId: data.post_id,
      createdAt: data.created_at,
    };
  }

  async removeBookmark(userId: string, postId: string): Promise<void> {
    await this.assertActingAs(userId);
    const validatedPostId = postIdSchema.parse(postId);

    const { error } = await this.client
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', validatedPostId);

    if (error) throw error;
  }

  async reportPost(
    postId: string,
    reason: ReportReason,
    detail?: string,
    reporter?: { userId: string } | { key: string }
  ): Promise<Report> {
    const validatedPostId = postIdSchema.parse(postId);
    const validatedReason = reportReasonSchema.parse(reason);
    const validatedDetail = detail ? reportDetailSchema.parse(detail) : null;

    let payload: {
      post_id: string;
      reason: ReportReason;
      detail: string | null;
      reporter_id?: string;
      reporter_key?: string;
    };

    if (reporter && 'userId' in reporter) {
      await this.assertActingAs(reporter.userId);
      payload = {
        post_id: validatedPostId,
        reason: validatedReason,
        detail: validatedDetail,
        reporter_id: reporter.userId,
      };
    } else if (reporter && 'key' in reporter) {
      if (!PUBLIC_BOARD) {
        throw new Error('認証が必要です。');
      }
      payload = {
        post_id: validatedPostId,
        reason: validatedReason,
        detail: validatedDetail,
        reporter_key: reporter.key,
      };
    } else {
      throw new Error('通報者情報がありません。');
    }

    const writeClient =
      reporter && 'key' in reporter ? createPublicClient() : this.client;

    const { error } = await writeClient.from('reports').insert(payload);

    // 匿名は RETURNING / 再SELECT が RLS で 401 になる。重複は 23505。
    if (error && !isUniqueViolation(error)) throw error;

    return submittedReport({
      postId: validatedPostId,
      reason: validatedReason,
      detail: validatedDetail,
      reporterId: payload.reporter_id,
      reporterKey: payload.reporter_key,
    });
  }

  async hidePost(userId: string, postId: string) {
    await this.assertActingAs(userId);
    const validatedPostId = postIdSchema.parse(postId);
    const { error } = await this.client.from('hidden_posts').insert({
      user_id: userId,
      post_id: validatedPostId,
    });
    if (error) throw error;
  }

  async unhidePost(userId: string, postId: string) {
    await this.assertActingAs(userId);
    const validatedPostId = postIdSchema.parse(postId);
    const { error } = await this.client
      .from('hidden_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', validatedPostId);
    if (error) throw error;
  }

  async isPostHidden(userId: string, postId: string) {
    const { data, error } = await this.client
      .from('hidden_posts')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) return false;
    return Boolean(data);
  }

  async getReports(status?: Report['status']): Promise<Report[]> {
    await this.assertIsAdmin();
    let query = this.client
      .from('reports')
      .select(
        'id, post_id, reporter_id, reporter_key, reason, detail, status, created_at'
      )
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[supabase] getReports:', error.message);
      return [];
    }

    return (data ?? []).map(mapReportRow);
  }

  async resolveReports(postIds: string[]): Promise<void> {
    await this.assertIsAdmin();
    if (postIds.length === 0) return;
    const validatedIds = postIds.map((id) => postIdSchema.parse(id));

    const { error } = await this.client
      .from('reports')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .in('post_id', validatedIds)
      .eq('status', 'pending');

    if (error) throw error;
  }
}

export const supabaseDataRepository = new SupabaseDataRepository();
