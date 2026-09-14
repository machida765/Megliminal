import type { UserRole } from '@/types';
import { isAdminRole } from '@/lib/auth/roles';

function getDesignatedAdminUserId(): string | undefined {
  const id =
    process.env.ADMIN_USER_ID?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_USER_ID?.trim();
  return id || undefined;
}

/** 管理画面・通報一覧へアクセスできるユーザーか */
export function canAccessAdmin(
  userId: string | null | undefined,
  role: UserRole | string | null | undefined
): boolean {
  if (!userId) return false;
  const designated = getDesignatedAdminUserId();
  if (designated) {
    return userId === designated && isAdminRole(role);
  }
  return isAdminRole(role);
}
