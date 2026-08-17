import { localStore } from '@/lib/data/local-store';
import type {
  Bookmark,
  HiddenPost,
  Like,
  MajorCategory,
  Post,
  Report,
  SubCategory,
  Tag,
} from '@/types';
import type { LocalStoreUser } from '@/lib/data/local-store';

const STORAGE_KEY = 'megliminal-local-store-v1';

export type PersistedLocalStore = {
  majorCategories: MajorCategory[];
  subCategories: SubCategory[];
  tags: Tag[];
  users: LocalStoreUser[];
  posts: Post[];
  likes: Like[];
  bookmarks: Bookmark[];
  reports: Report[];
  hiddenPosts: HiddenPost[];
};

export function persistLocalStore(): void {
  if (typeof window === 'undefined') return;

  const payload: PersistedLocalStore = {
    majorCategories: localStore.majorCategories,
    subCategories: localStore.subCategories,
    tags: localStore.tags,
    users: localStore.users,
    posts: localStore.posts,
    likes: localStore.likes,
    bookmarks: localStore.bookmarks,
    reports: localStore.reports,
    hiddenPosts: localStore.hiddenPosts,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[local] persist failed:', error);
  }
}

export function hydrateLocalStoreFromStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const data = JSON.parse(raw) as PersistedLocalStore;
    localStore.majorCategories = data.majorCategories;
    localStore.subCategories = data.subCategories;
    localStore.tags = data.tags;
    localStore.users = data.users;
    localStore.posts = data.posts;
    localStore.likes = data.likes;
    localStore.bookmarks = data.bookmarks ?? [];
    localStore.reports = data.reports ?? [];
    localStore.hiddenPosts = data.hiddenPosts ?? [];
    return true;
  } catch (error) {
    console.warn('[local] hydrate failed:', error);
    return false;
  }
}

export function clearPersistedLocalStore(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
