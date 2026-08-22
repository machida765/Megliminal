import { createClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/auth/roles';
import type { Profile } from '@/types';

/** サーバー側: ログイン中ユーザーの profiles 行を取得 */
export async function getServerProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role as Profile['role'],
    createdAt: data.created_at,
  };
}

/** サーバー側: 現在のユーザーが admin か */
export async function isServerAdmin(userId: string): Promise<boolean> {
  const profile = await getServerProfile(userId);
  return isAdminRole(profile?.role);
}
