/**
 * いったんログインなしの透明掲示板。
 * true のあいだはナビからも URL 直打ちでもログインできない。
 * 認証・プロフィール・ブックマークのコードは残す。ユーザー機能を戻すときは false にする。
 */
export const PUBLIC_BOARD: boolean = true;

/** 投稿者アイコン・プロフィール・ユーザーランキング。掲示板モードでは出さない。 */
export const SHOW_USER_IDENTITY = !PUBLIC_BOARD;

/** 投稿へのコメント。いったんオフ。戻すときは true。 */
export const SHOW_COMMENTS = false;

export const ANONYMOUS_AUTHOR_ID = 'anonymous';
export const ANONYMOUS_AUTHOR_NAME = '匿名';

export function isIdentifiableUserId(
  userId: string | null | undefined
): userId is string {
  return Boolean(userId) && userId !== ANONYMOUS_AUTHOR_ID;
}

const ANON_LIKES_KEY = 'megliminal.anonLikedPosts';

export function readAnonLikedPostIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ANON_LIKES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function hasAnonLiked(postId: string): boolean {
  return readAnonLikedPostIds().includes(postId);
}

export function markAnonLiked(postId: string): void {
  if (typeof window === 'undefined') return;
  const ids = new Set(readAnonLikedPostIds());
  ids.add(postId);
  window.localStorage.setItem(ANON_LIKES_KEY, JSON.stringify([...ids]));
}
