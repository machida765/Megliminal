/** デフォルトアバター池（public/avatars/000.svg … 099.svg） */
export const DEFAULT_AVATAR_COUNT = 100;

export function getDefaultAvatarPath(index: number): string {
  const normalized =
    ((index % DEFAULT_AVATAR_COUNT) + DEFAULT_AVATAR_COUNT) %
    DEFAULT_AVATAR_COUNT;
  return `/avatars/${String(normalized).padStart(3, '0')}.svg`;
}

/** ユーザー ID から同じ人には常に同じアイコン */
export function getAvatarPathForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return getDefaultAvatarPath(hash);
}

export function pickRandomAvatarPath(): string {
  return getDefaultAvatarPath(Math.floor(Math.random() * DEFAULT_AVATAR_COUNT));
}

export function isImageAvatar(value?: string | null): boolean {
  if (!value) return false;
  if (
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes('..') &&
    !/[\u0000-\u001f\u007f]/.test(value)
  ) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** DB の avatar_url を表示用に正規化（旧 emoji デフォルトはプールから補完） */
export function resolveAvatarUrl(
  avatarUrl: string | undefined | null,
  userId: string
): string {
  if (avatarUrl && isImageAvatar(avatarUrl)) return avatarUrl;
  if (avatarUrl && avatarUrl !== '👤') return avatarUrl;
  return getAvatarPathForUserId(userId);
}
