import {
  MAJOR_CATEGORIES as SEED_CATEGORIES,
  POSTS as SEED_POSTS,
  SUB_CATEGORIES as SEED_SUB_CATEGORIES,
  TAGS as SEED_TAGS,
  USERS as SEED_USERS,
} from '@/data/dummy';
import type {
  Bookmark,
  HiddenPost,
  Like,
  MajorCategory,
  Post,
  Report,
  SubCategory,
  Tag,
  User,
} from '@/types';

export type LocalStoreUser = User & { email?: string };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** ローカルログイン用のテストメール（パスワードは任意） */
const DEV_USER_EMAILS: Record<string, string> = {
  'user-001': 'taro@test.local',
  'user-002': 'hanako@test.local',
  'user-003': 'jiro@test.local',
  'user-004': 'yuki@test.local',
};

function seedUsers(): LocalStoreUser[] {
  return clone(SEED_USERS).map((user) => ({
    ...user,
    email: DEV_USER_EMAILS[user.id],
  }));
}

/** 投稿の likeCount に合わせて、期間分散したいいねシードを生成 */
function generateSeedLikes(posts: Post[]): Like[] {
  const likes: Like[] = [];
  const userIds = ['user-001', 'user-002', 'user-003', 'user-004'];

  for (const post of posts) {
    for (let i = 0; i < post.likeCount; i++) {
      let daysAgo: number;
      const ratio = i / Math.max(post.likeCount, 1);
      if (ratio < 0.35) {
        daysAgo = Math.random() * 6;
      } else if (ratio < 0.65) {
        daysAgo = 7 + Math.random() * 20;
      } else {
        daysAgo = 28 + Math.random() * 45;
      }

      likes.push({
        id: `like-${post.id}-${i}`,
        postId: post.id,
        userId: userIds[i % userIds.length],
        createdAt: new Date(
          Date.now() - daysAgo * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }
  }

  return likes;
}

/** ローカル開発用ストア（ブラウザでは localStorage に永続化） */
class LocalStore {
  majorCategories: MajorCategory[] = clone(SEED_CATEGORIES);
  subCategories: SubCategory[] = clone(SEED_SUB_CATEGORIES);
  tags: Tag[] = clone(SEED_TAGS);
  users: LocalStoreUser[] = seedUsers();
  posts: Post[] = clone(SEED_POSTS);
  likes: Like[] = generateSeedLikes(clone(SEED_POSTS));
  bookmarks: Bookmark[] = [];
  reports: Report[] = [];
  hiddenPosts: HiddenPost[] = [];

  reset() {
    this.majorCategories = clone(SEED_CATEGORIES);
    this.subCategories = clone(SEED_SUB_CATEGORIES);
    this.tags = clone(SEED_TAGS);
    this.users = seedUsers();
    this.posts = clone(SEED_POSTS);
    this.likes = generateSeedLikes(this.posts);
    this.bookmarks = [];
    this.reports = [];
    this.hiddenPosts = [];
  }
}

export const localStore = new LocalStore();
