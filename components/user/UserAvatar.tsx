import {
  isImageAvatar,
  resolveAvatarUrl,
} from '@/lib/avatars';
import { SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  userId: string;
  name?: string;
  avatarUrl?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  userId,
  name = '',
  avatarUrl,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  if (!SHOW_USER_IDENTITY) return null;

  const resolved = resolveAvatarUrl(avatarUrl, userId);

  if (isImageAvatar(resolved)) {
    return (
      <img
        src={resolved}
        alt={name ? `${name}のアイコン` : ''}
        className={cn(
          'rounded-full object-cover bg-soft/40 shrink-0',
          className,
          imageClassName
        )}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0', className, fallbackClassName)}
      aria-hidden={!name}
      title={name || undefined}
    >
      {resolved || '👤'}
    </span>
  );
}
