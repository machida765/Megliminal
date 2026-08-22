import type { UserRole } from '@/types';

export function isAdminRole(role: UserRole | string | undefined | null): boolean {
  return role === 'admin';
}
