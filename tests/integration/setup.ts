import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const hasSupabaseCredentials = Boolean(ANON_KEY && SERVICE_KEY);

/** ローカル Supabase が起きているか。起きていなければ結合テストはスキップする。 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (!hasSupabaseCredentials) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient;
}

/**
 * テスト用ユーザーを作って、そのユーザーとしてログイン済みの anon クライアントを返す。
 * profiles 行は handle_new_user トリガーが作る。
 */
export async function createTestUser(
  admin: SupabaseClient,
  label: string,
  role: 'user' | 'admin' = 'user'
): Promise<TestUser> {
  const email = `rls-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.test`;
  const password = 'Test-Password-1234';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: `RLS ${label}` },
  });
  if (error || !data.user) throw error ?? new Error('テストユーザー作成に失敗');

  if (role === 'admin') {
    const { error: roleError } = await admin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);
    if (roleError) throw roleError;
  }

  const client = createAnonClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return { id: data.user.id, email, password, client };
}

export async function deleteTestUsers(
  admin: SupabaseClient,
  userIds: string[]
): Promise<void> {
  for (const id of userIds) {
    await admin.auth.admin.deleteUser(id).catch(() => undefined);
  }
}

/** 初期データに必ず存在する大カテゴリ id を1つ返す。 */
export async function getAnyMajorCategoryId(
  admin: SupabaseClient
): Promise<string> {
  const { data, error } = await admin
    .from('major_categories')
    .select('id')
    .limit(1)
    .single();
  if (error || !data) throw error ?? new Error('大カテゴリが存在しません');
  return data.id as string;
}

export async function createPostAs(
  user: TestUser,
  majorCategoryId: string,
  title = 'RLS テスト投稿'
): Promise<string> {
  const { data, error } = await user.client
    .from('posts')
    .insert({
      user_id: user.id,
      major_category_id: majorCategoryId,
      title,
      description: 'RLS テスト用の説明文です。',
    })
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('投稿作成に失敗');
  return data.id as string;
}
