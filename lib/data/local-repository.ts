import { checkPostFrequency } from '@/lib/post-frequency';
import {
  countLikesForPost,
  countLikesReceivedByUser,
  countPostsForUser,
  syncPostLikeCounts,
} from '@/lib/ranking';
import { localStore } from '@/lib/data/local-store';
import {
  hydrateLocalStoreFromStorage,
  persistLocalStore,
} from '@/lib/data/local-persistence';
import type {
  CreatePostInput,
  CreateUserInput,
  DataRepository,
  HomePageData,
  PostRankingOptions,
  UpdatePostInput,
  UserRankingOptions,
} from '@/lib/data/types';
import type {
  Bookmark,
  MajorCategory,
  Post,
  PostRankingEntry,
  Profile,
  Report,
  ReportReason,
  SubCategory,
  User,
  UserRankingEntry,
} from '@/types';

if (typeof window !== 'undefined') {
  hydrateLocalStoreFromStorage();
}

function saveLocalStore() {
  persistLocalStore();
}

function attachUser(post: Post): Post {
  const user = localStore.users.find((u) => u.id === post.userId);
  return {
    ...post,
    user: user ?? { id: post.userId, name: 'Unknown', avatarUrl: '👤' },
  };
}

function filterHidden(posts: Post[], viewerUserId?: string): Post[] {
  if (!viewerUserId) return posts;
  const hidden = new Set(
    localStore.hiddenPosts
      .filter((h) => h.userId === viewerUserId)
      .map((h) => h.postId)
  );
  return posts.filter((p) => !hidden.has(p.id));
}

export class LocalDataRepository implements DataRepository {
  private visiblePosts(viewerUserId?: string) {
    syncPostLikeCounts(localStore.posts, localStore.likes);
    return filterHidden(localStore.posts.map(attachUser), viewerUserId);
  }

  async getMajorCategories() {
    return [...localStore.majorCategories].sort((a, b) => a.order - b.order);
  }

  async getSubCategories() {
    return [...localStore.subCategories].sort((a, b) => a.order - b.order);
  }

  async getTags() {
    return [...localStore.tags].sort((a, b) => a.order - b.order);
  }

  async getHomePageData(): Promise<HomePageData> {
    syncPostLikeCounts(localStore.posts, localStore.likes);
    const posts = localStore.posts.map(attachUser);

    const recentPosts = [...posts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    const popularPosts = [...posts]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 6);

    const heroCandidates = posts
      .filter((post) => post.likeCount > 10)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10);

    const [categories, subCategories, tags, rankingEntries] = await Promise.all([
      this.getMajorCategories(),
      this.getSubCategories(),
      this.getTags(),
      this.getPostRankings({ period: 'week', limit: 5 }),
    ]);

    return {
      recentPosts,
      popularPosts,
      heroCandidates,
      rankingEntries,
      stats: {
        postCount: posts.length,
        likeCount: posts.reduce((sum, post) => sum + post.likeCount, 0),
        userCount: new Set(posts.map((post) => post.userId)).size,
      },
      categories,
      subCategories,
      tags,
    };
  }

  async getPosts(viewerUserId?: string) {
    return this.visiblePosts(viewerUserId);
  }

  async getPost(id: string, viewerUserId?: string) {
    const post = localStore.posts.find((p) => p.id === id);
    if (!post) return null;
    if (viewerUserId) {
      const hidden = localStore.hiddenPosts.some(
        (h) => h.userId === viewerUserId && h.postId === id
      );
      if (hidden) return null;
    }
    return attachUser(post);
  }

  async getPostsByUser(userId: string, viewerUserId?: string) {
    return this.visiblePosts(viewerUserId).filter((p) => p.userId === userId);
  }

  async getUser(id: string) {
    return localStore.users.find((u) => u.id === id) ?? null;
  }

  async getProfile(id: string) {
    const user = await this.getUser(id);
    if (!user) return null;
    const stored = localStore.users.find((u) => u.id === id);
    return {
      ...user,
      email: stored?.email,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };
  }

  async createPost(input: CreatePostInput) {
    const user = localStore.users.find((u) => u.id === input.userId);
    if (!user) throw new Error('User not found');

    const post: Post = {
      id: `post-${Date.now()}`,
      userId: input.userId,
      user,
      majorCategoryId: input.majorCategoryId,
      subCategoryId: input.subCategoryId ?? null,
      tagIds: input.tagIds ?? [],
      title: input.title,
      description: input.description,
      url: input.url,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    };

    localStore.posts.unshift(post);
    saveLocalStore();
    return post;
  }

  async updatePost(id: string, input: UpdatePostInput) {
    const index = localStore.posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Post not found');

    const current = localStore.posts[index];
    const updated: Post = {
      ...current,
      ...input,
      tagIds: input.tagIds ?? current.tagIds,
    };
    localStore.posts[index] = updated;
    saveLocalStore();
    return attachUser(updated);
  }

  async deletePost(id: string) {
    await this.deletePosts([id]);
  }

  async deletePosts(ids: string[]) {
    const idSet = new Set(ids);
    localStore.posts = localStore.posts.filter((p) => !idSet.has(p.id));
    localStore.likes = localStore.likes.filter((l) => !idSet.has(l.postId));
    localStore.bookmarks = localStore.bookmarks.filter(
      (b) => !idSet.has(b.postId)
    );
    localStore.reports = localStore.reports.filter(
      (r) => !idSet.has(r.postId)
    );
    localStore.hiddenPosts = localStore.hiddenPosts.filter(
      (h) => !idSet.has(h.postId)
    );
    saveLocalStore();
  }

  async checkPostFrequency(userId: string, majorCategoryId: string) {
    // ローカル開発では投稿テストを優先し、週1制限をスキップ
    if (process.env.NODE_ENV === 'development') {
      return { canPost: true };
    }
    return checkPostFrequency(localStore.posts, userId, majorCategoryId);
  }

  async updateUser(id: string, data: Partial<Pick<User, 'name' | 'avatarUrl'>>) {
    const user = localStore.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    if (data.name !== undefined) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    return { ...user };
  }

  async upsertMajorCategory(category: MajorCategory) {
    const index = localStore.majorCategories.findIndex((c) => c.id === category.id);
    if (index === -1) {
      localStore.majorCategories.push(category);
    } else {
      localStore.majorCategories[index] = category;
    }
    return category;
  }

  async deleteMajorCategory(id: string) {
    const index = localStore.majorCategories.findIndex((c) => c.id === id);
    if (index !== -1) localStore.majorCategories.splice(index, 1);
  }

  async reorderMajorCategories(ids: string[]) {
    const map = new Map(localStore.majorCategories.map((c) => [c.id, c]));
    localStore.majorCategories = ids
      .map((id, i) => {
        const cat = map.get(id);
        return cat ? { ...cat, order: i + 1 } : null;
      })
      .filter(Boolean) as MajorCategory[];
    return this.getMajorCategories();
  }

  async getComments(_postId: string) {
    return [];
  }

  async getLikes(postId?: string) {
    if (postId) {
      return localStore.likes.filter((l) => l.postId === postId);
    }
    return [...localStore.likes];
  }

  async getPostRankings(options: PostRankingOptions): Promise<PostRankingEntry[]> {
    const { period, categoryId, limit = 20 } = options;
    let posts = await this.getPosts();

    if (categoryId) {
      posts = posts.filter((p) => p.majorCategoryId === categoryId);
    }

    const ranked = posts
      .map((post) => ({
        post,
        likeCount: countLikesForPost(localStore.likes, post.id, period),
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
    const users = [...localStore.users];

    const ranked = users
      .map((user) => ({
        user,
        value:
          sortBy === 'likes'
            ? countLikesReceivedByUser(
                localStore.likes,
                localStore.posts,
                user.id,
                period
              )
            : countPostsForUser(localStore.posts, user.id, period),
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

  async getBookmarks(userId: string) {
    const postIds = localStore.bookmarks
      .filter((b) => b.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((b) => b.postId);

    const posts = await this.getPosts(userId);
    const map = new Map(posts.map((p) => [p.id, p]));
    return postIds.map((id) => map.get(id)).filter(Boolean) as Post[];
  }

  async isBookmarked(userId: string, postId: string) {
    return localStore.bookmarks.some(
      (b) => b.userId === userId && b.postId === postId
    );
  }

  async addBookmark(userId: string, postId: string): Promise<Bookmark> {
    const existing = localStore.bookmarks.find(
      (b) => b.userId === userId && b.postId === postId
    );
    if (existing) return existing;

    const bookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      userId,
      postId,
      createdAt: new Date().toISOString(),
    };
    localStore.bookmarks.unshift(bookmark);
    return bookmark;
  }

  async removeBookmark(userId: string, postId: string) {
    const index = localStore.bookmarks.findIndex(
      (b) => b.userId === userId && b.postId === postId
    );
    if (index !== -1) localStore.bookmarks.splice(index, 1);
  }

  async reportPost(
    reporterId: string,
    postId: string,
    reason: ReportReason,
    detail?: string
  ): Promise<Report> {
    const report: Report = {
      id: `report-${Date.now()}`,
      postId,
      reporterId,
      reason,
      detail,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    localStore.reports.unshift(report);
    return report;
  }

  async hidePost(userId: string, postId: string) {
    const exists = localStore.hiddenPosts.some(
      (h) => h.userId === userId && h.postId === postId
    );
    if (exists) return;
    localStore.hiddenPosts.push({
      userId,
      postId,
      createdAt: new Date().toISOString(),
    });
  }

  async unhidePost(userId: string, postId: string) {
    localStore.hiddenPosts = localStore.hiddenPosts.filter(
      (h) => !(h.userId === userId && h.postId === postId)
    );
  }

  async isPostHidden(userId: string, postId: string) {
    return localStore.hiddenPosts.some(
      (h) => h.userId === userId && h.postId === postId
    );
  }

  async getReports(status?: Report['status']) {
    const reports = [...localStore.reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!status) return reports;
    return reports.filter((r) => r.status === status);
  }

  async resolveReports(postIds: string[]) {
    const idSet = new Set(postIds);
    for (const report of localStore.reports) {
      if (idSet.has(report.postId)) {
        report.status = 'resolved';
      }
    }
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: `user-${Date.now()}`,
      name: input.name,
      avatarUrl: input.avatarUrl ?? '👤',
    };
    localStore.users.push(user);
    saveLocalStore();
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const index = localStore.users.findIndex(
      (u) => (u as User & { email?: string }).email?.toLowerCase() === normalized
    );
    return index === -1 ? null : localStore.users[index];
  }

  async registerUser(input: CreateUserInput): Promise<User> {
    const user = await this.createUser(input);
    (user as User & { email?: string }).email = input.email.trim().toLowerCase();
    saveLocalStore();
    return user;
  }

  async resetToSeed() {
    localStore.reset();
    saveLocalStore();
  }
}

export const localDataRepository = new LocalDataRepository();
