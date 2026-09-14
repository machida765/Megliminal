import { afterEach, describe, expect, it } from 'vitest';
import { canAccessAdmin } from '@/lib/auth/admin-access';

describe('canAccessAdmin', () => {
  const originalAdmin = process.env.ADMIN_USER_ID;

  afterEach(() => {
    if (originalAdmin === undefined) {
      delete process.env.ADMIN_USER_ID;
    } else {
      process.env.ADMIN_USER_ID = originalAdmin;
    }
  });

  it('role=admin ならアクセス可（ADMIN_USER_ID 未設定時）', () => {
    delete process.env.ADMIN_USER_ID;
    expect(canAccessAdmin('user-1', 'admin')).toBe(true);
    expect(canAccessAdmin('user-2', 'user')).toBe(false);
  });

  it('ADMIN_USER_ID 設定時はその UUID かつ admin のみ', () => {
    process.env.ADMIN_USER_ID = 'owner-1';
    expect(canAccessAdmin('owner-1', 'admin')).toBe(true);
    expect(canAccessAdmin('owner-1', 'user')).toBe(false);
    expect(canAccessAdmin('other-admin', 'admin')).toBe(false);
  });
});
