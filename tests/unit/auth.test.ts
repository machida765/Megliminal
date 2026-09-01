import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { getSafeRedirectPath } from '@/lib/auth/safe-redirect';
import { isAdminRole } from '@/lib/auth/roles';
import {
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  hasEmailPasswordIdentity,
} from '@/lib/auth/account';

describe('getSafeRedirectPath', () => {
  it.each(['/', '/search', '/post/abc?tab=1', '/profile/1#top'])(
    '同一オリジンの %s はそのまま通す',
    (path) => {
      expect(getSafeRedirectPath(path)).toBe(path);
    }
  );

  it.each([
    '//evil.example',
    'https://evil.example',
    '/\\evil.example',
    'search',
    '',
  ])('危険な %s は fallback に落とす', (path) => {
    expect(getSafeRedirectPath(path)).toBe('/');
  });

  it('null / undefined は fallback', () => {
    expect(getSafeRedirectPath(null)).toBe('/');
    expect(getSafeRedirectPath(undefined)).toBe('/');
  });

  it('制御文字を含むパスを弾く', () => {
    expect(getSafeRedirectPath('/a\nb')).toBe('/');
  });

  it('fallback を指定できる', () => {
    expect(getSafeRedirectPath('//evil.example', '/login')).toBe('/login');
  });
});

describe('isAdminRole', () => {
  it('admin だけ true', () => {
    expect(isAdminRole('admin')).toBe(true);
  });

  it.each(['user', 'ADMIN', '', undefined, null])('%s は false', (role) => {
    expect(isAdminRole(role as string | undefined | null)).toBe(false);
  });
});

describe('hasEmailPasswordIdentity', () => {
  const userWith = (providers: string[]) =>
    ({
      identities: providers.map((provider) => ({ provider })),
    }) as unknown as User;

  it('email identity があれば true', () => {
    expect(hasEmailPasswordIdentity(userWith(['email']))).toBe(true);
  });

  it('OAuth のみなら false', () => {
    expect(hasEmailPasswordIdentity(userWith(['google', 'github']))).toBe(false);
  });

  it('identities が無ければ false', () => {
    expect(hasEmailPasswordIdentity({} as User)).toBe(false);
  });

  it('確認フレーズが変わっていないこと', () => {
    expect(DELETE_ACCOUNT_CONFIRM_PHRASE).toBe('退会する');
  });
});
