import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkPostFrequency } from '@/lib/post-frequency';
import {
  countLikesForPost,
  countLikesReceivedByUser,
  countPostsForUser,
} from '@/lib/ranking';
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
import type {
  Like,
  MajorCategory,
  Post,
  PostRankingEntry,
  Profile,
  Report,
  SubCategory,
  User,
  UserRankingEntry,
} from '@/types';

function notReady(): never {
  throw new Error(
    'Supabase データソースは Phase 3 で接続します。画面開発中は NEXT_PUBLIC_DATA_SOURCE=local を使ってください。'
  );
}

type PostsSelectQuery = ReturnType<
  ReturnType<SupabaseClient['from']>['select']
>;

/** Supabase 実装 */
export class SupabaseDataRepository implements DataRepository {
  constructor(
    private readonly clientFactory: () => SupabaseClient = createClient
  ) {}

  private get client() {
    return this.clientFactory();
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
    let query = this.client.from('posts').select(POST_SELECT);

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

    return (data as SupabasePostRow[]).map(mapSupabasePost);
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
      .select('id, name, icon, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getMajorCategories:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? undefined,
      order: row.sort_order,
      isActive: row.is_active,
    }));
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
    const [
      categories,
      tags,
      recentPosts,
      popularPosts,
      heroCandidates,
      rankingEntries,
      stats,
    ] = await Promise.all([
      this.getMajorCategories(),
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
    return mapSupabasePost(data as SupabasePostRow);
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
    const { data, error } = await this.client
      .from('posts')
      .insert({
        user_id: input.userId,
        major_category_id: input.majorCategoryId,
        sub_category_id: input.subCategoryId ?? null,
        title: input.title,
        description: input.description,
        url: input.url ?? null,
      })
      .select(POST_SELECT)
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to create post');
    }

    const tagIds = input.tagIds ?? [];
    if (tagIds.length > 0) {
      await this.syncPostTags(data.id, tagIds);
      const created = await this.getPost(data.id);
      if (created) return created;
    }

    return mapSupabasePost(data as SupabasePostRow);
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const payload: Record<string, unknown> = {};
    if (input.majorCategoryId !== undefined) {
      payload.major_category_id = input.majorCategoryId;
    }
    if (input.subCategoryId !== undefined) {
      payload.sub_category_id = input.subCategoryId;
    }
    if (input.title !== undefined) payload.title = input.title;
    if (input.description !== undefined) payload.description = input.description;
    if (input.url !== undefined) payload.url = input.url ?? null;

    const { error } = await this.client.from('posts').update(payload).eq('id', id);

    if (error) throw error;

    if (input.tagIds !== undefined) {
      await this.syncPostTags(id, input.tagIds);
    }

    const updated = await this.getPost(id);
    if (!updated) throw new Error('Post not found after update');
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await this.deletePosts([id]);
  }

  async deletePosts(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await this.client.from('posts').delete().in('id', ids);
    if (error) throw error;
  }

  async checkPostFrequency(userId: string, majorCategoryId: string) {
    const posts = await this.fetchPosts((q) =>
      q.eq('user_id', userId).eq('major_category_id', majorCategoryId)
    );
    return checkPostFrequency(posts, userId, majorCategoryId);
  }

  async updateUser(id: string, data: Partial<Pick<User, 'name' | 'avatarUrl'>>) {
    const { data: updated, error } = await this.client
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatarUrl,
      })
      .eq('id', id)
      .select('id, name, avatar_url')
      .single();

    if (error || !updated) throw error ?? new Error('Update failed');

    return {
      id: updated.id,
      name: updated.name,
      avatarUrl: updated.avatar_url ?? undefined,
    };
  }

  async upsertMajorCategory(): Promise<MajorCategory> {
    notReady();
  }

  async deleteMajorCategory(): Promise<void> {
    notReady();
  }

  async reorderMajorCategories(): Promise<MajorCategory[]> {
    notReady();
  }

  async getComments() {
    return [];
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

  async getPostRankings(options: PostRankingOptions): Promise<PostRankingEntry[]> {
    const { period, categoryId, limit = 20 } = options;
    let posts = await this.getPosts();
    const likes = await this.getLikes();

    if (categoryId) {
      posts = posts.filter((p) => p.majorCategoryId === categoryId);
    }

    const ranked = posts
      .map((post) => ({
        post,
        likeCount: countLikesForPost(likes, post.id, period),
      }))
      .filter((item) => item.likeCount > 0)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit);

    return ranked.map((item, index) => ({
      rank: index + 1,
      post: item.post,
      likeCount: item.likeCount,
    }));
  }

  async getUserRankings(options: UserRankingOptions): Promise<UserRankingEntry[]> {
    const { period, sortBy, limit = 20 } = options;
    const { data: profileRows, error } = await this.client
      .from('profiles')
      .select('id, name, avatar_url');

    if (error) {
      console.warn('[supabase] getUserRankings:', error.message);
      return [];
    }

    const users: User[] = (profileRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      avatarUrl: row.avatar_url ?? undefined,
    }));

    const posts = await this.getPosts();
    const likes = await this.getLikes();

    const ranked = users
      .map((user) => ({
        user,
        value:
          sortBy === 'likes'
            ? countLikesReceivedByUser(likes, posts, user.id, period)
            : countPostsForUser(posts, user.id, period),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    return ranked.map((item, index) => ({
      rank: index + 1,
      user: item.user,
      value: item.value,
    }));
  }

  async getBookmarks() {
    return [];
  }

  async isBookmarked() {
    return false;
  }

  async addBookmark() {
    notReady();
  }

  async removeBookmark() {
    notReady();
  }

  async reportPost() {
    notReady();
  }

  async hidePost(userId: string, postId: string) {
    const { error } = await this.client.from('hidden_posts').insert({
      user_id: userId,
      post_id: postId,
    });
    if (error) throw error;
  }

  async unhidePost(userId: string, postId: string) {
    const { error } = await this.client
      .from('hidden_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
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

  async getReports(): Promise<Report[]> {
    return [];
  }

  async resolveReports() {
    notReady();
  }
}

export const supabaseDataRepository = new SupabaseDataRepository();
