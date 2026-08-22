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
  Tag,
  User,
  UserRankingEntry,
  UserRankingSort,
} from '@/types';
import type { PostFrequencyCheck } from '@/types';

export type CreatePostInput = {
  userId: string;
  majorCategoryId: string;
  subCategoryId?: string | null;
  tagIds?: string[];
  title: string;
  description: string;
  url?: string;
};

export type UpdatePostInput = {
  majorCategoryId?: string;
  subCategoryId?: string | null;
  tagIds?: string[];
  title?: string;
  description?: string;
  url?: string | null;
};

export type CreateUserInput = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export type PostRankingOptions = {
  period: RankingPeriod;
  categoryId?: string;
  limit?: number;
};

export type UserRankingOptions = {
  period: RankingPeriod;
  sortBy: UserRankingSort;
  limit?: number;
};

export type HomePageStats = {
  postCount: number;
  likeCount: number;
  userCount: number;
};

/** トップページ用の共有スナップショット（全ユーザー共通） */
export type HomePageData = {
  recentPosts: Post[];
  popularPosts: Post[];
  rankingEntries: PostRankingEntry[];
  heroCandidates: Post[];
  stats: HomePageStats;
  categories: MajorCategory[];
  subCategories: SubCategory[];
  tags: Tag[];
};

/** 画面が使うデータ操作の一覧。実装は supabase-repository。 */
export interface DataRepository {
  getMajorCategories(): Promise<MajorCategory[]>;
  getSubCategories(): Promise<SubCategory[]>;
  getTags(): Promise<Tag[]>;
  getHomePageData(): Promise<HomePageData>;
  getPosts(viewerUserId?: string): Promise<Post[]>;
  getPost(id: string, viewerUserId?: string): Promise<Post | null>;
  getPostsByUser(userId: string, viewerUserId?: string): Promise<Post[]>;
  getUser(id: string): Promise<User | null>;
  getProfile(id: string): Promise<Profile | null>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, input: UpdatePostInput): Promise<Post>;
  deletePost(id: string): Promise<void>;
  deletePosts(ids: string[]): Promise<void>;
  checkPostFrequency(userId: string, majorCategoryId: string): Promise<PostFrequencyCheck>;
  updateUser(id: string, data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User>;
  upsertMajorCategory(category: MajorCategory): Promise<MajorCategory>;
  deleteMajorCategory(id: string): Promise<void>;
  reorderMajorCategories(ids: string[]): Promise<MajorCategory[]>;
  getComments(postId: string): Promise<Comment[]>;
  getLikes(postId?: string): Promise<Like[]>;
  // ランキング
  getPostRankings(options: PostRankingOptions): Promise<PostRankingEntry[]>;
  getUserRankings(options: UserRankingOptions): Promise<UserRankingEntry[]>;
  // ブックマーク
  getBookmarks(userId: string): Promise<Post[]>;
  isBookmarked(userId: string, postId: string): Promise<boolean>;
  addBookmark(userId: string, postId: string): Promise<Bookmark>;
  removeBookmark(userId: string, postId: string): Promise<void>;
  // モデレーション
  reportPost(
    reporterId: string,
    postId: string,
    reason: ReportReason,
    detail?: string
  ): Promise<Report>;
  hidePost(userId: string, postId: string): Promise<void>;
  unhidePost(userId: string, postId: string): Promise<void>;
  isPostHidden(userId: string, postId: string): Promise<boolean>;
  getReports(status?: Report['status']): Promise<Report[]>;
  resolveReports(postIds: string[]): Promise<void>;
}
