import type { User } from '@supabase/supabase-js';

/** メール+パスワードで登録したユーザーか（OAuth のみでは false） */
export function hasEmailPasswordIdentity(user: User): boolean {
  return user.identities?.some((identity) => identity.provider === 'email') ?? false;
}

export const DELETE_ACCOUNT_CONFIRM_PHRASE = '退会する';
