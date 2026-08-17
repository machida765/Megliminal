// types/index.ts（v3 - ランキング・ブックマーク・モデレーション）

import { getRankingPeriodLabels, getReportReasonLabels } from '@/lib/i18n/labels';

export type UserRole = 'user' | 'admin';

export type MajorCategory = {
  id: string;
  name: string;
  icon?: string;
  order: number;
  isActive: boolean;
};

/** 大ジャンル配下の中・小ジャンル（投稿時は任意、検索で細分化） */
export type SubCategory = {
  id: string;
  majorCategoryId: string;
  name: string;
  order: number;
  isActive: boolean;
};

/** @deprecated MajorCategory を使用してください */
export type Category = MajorCategory;

export type Tag = {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
};

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Profile = User & {
  email?: string;
  role: UserRole;
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  user: User;
  majorCategoryId: string;
  subCategoryId?: string | null;
  tagIds: string[];
  title: string;
  description: string;
  url?: string;
  createdAt: string;
  likeCount: number;
};

export type Like = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  user: User;
  body: string;
  createdAt: string;
};

/** 大ジャンルごとの週1投稿制限の判定結果 */
export type PostFrequencyCheck = {
  canPost: boolean;
  nextAvailableAt?: string;
  daysRemaining?: number;
};

/** ランキング期間 */
export type RankingPeriod = 'all' | 'month' | 'week';

/** 投稿ランキング行 */
export type PostRankingEntry = {
  rank: number;
  post: Post;
  likeCount: number;
};

/** ユーザーランキング行 */
export type UserRankingEntry = {
  rank: number;
  user: User;
  value: number;
};

/** ユーザーランキングの並び基準 */
export type UserRankingSort = 'likes' | 'posts';

/** ブックマーク */
export type Bookmark = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

/** 通報理由 */
export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'misinformation'
  | 'other';

/** 通報 */
export type Report = {
  id: string;
  postId: string;
  reporterId: string;
  reason: ReportReason;
  detail?: string;
  createdAt: string;
  status: 'pending' | 'resolved';
};

/** ユーザー個別の非表示 */
export type HiddenPost = {
  userId: string;
  postId: string;
  createdAt: string;
};

/** @deprecated getReportReasonLabels() または useTranslations() を使う */
export const REPORT_REASON_LABELS = getReportReasonLabels();

/** @deprecated getRankingPeriodLabels() または useTranslations() を使う */
export const RANKING_PERIOD_LABELS = getRankingPeriodLabels();
