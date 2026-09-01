import { test as base, expect, type Page } from '@playwright/test';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const E2E_PASSWORD = 'E2e-Password-1234';

export interface E2EUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

/**
 * supabase-js は Node 22 未満で WebSocket を要求するため、
 * E2E のセットアップは Auth Admin の REST API を直接叩く。
 */
async function adminFetch(path: string, init: RequestInit = {}) {
  if (!SERVICE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY が未設定です。.env.local を確認してください。'
    );
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase Admin API ${path} が ${response.status}: ${await response.text()}`
    );
  }

  return response;
}

export async function createE2EUser(label: string): Promise<E2EUser> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e-${label}-${suffix}@example.test`;
  const name = `E2E ${label} ${suffix.slice(-4)}`;

  const response = await adminFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: E2E_PASSWORD,
      email_confirm: true,
      user_metadata: { name },
    }),
  });

  const user = (await response.json()) as { id: string };
  return { id: user.id, email, password: E2E_PASSWORD, name };
}

export async function deleteE2EUser(userId: string): Promise<void> {
  await adminFetch(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }).catch(
    () => undefined
  );
}

/** ヘッダーの「ログイン」ボタンと区別するため、フォームの送信ボタンを指す */
export function loginSubmitButton(page: Page) {
  return page.locator('form button[type="submit"]');
}

export async function submitLogin(page: Page, user: E2EUser): Promise<void> {
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await loginSubmitButton(page).click();
}

export async function login(page: Page, user: E2EUser): Promise<void> {
  await page.goto('/login');
  await submitLogin(page, user);
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * alert / confirm をすべて受け入れつつ、出たメッセージを記録する。
 * 返り値の配列は非同期に埋まるので expect.poll で待つ。
 */
export function captureDialogs(page: Page): string[] {
  const messages: string[] = [];
  page.on('dialog', (dialog) => {
    messages.push(dialog.message());
    void dialog.accept();
  });
  return messages;
}

export const test = base.extend<{ user: E2EUser }>({
  // Playwright の慣例名 `use` は React Hook 判定に引っかかるため別名にする
  user: async ({}, provide, testInfo) => {
    const user = await createE2EUser(testInfo.parallelIndex.toString());
    await provide(user);
    await deleteE2EUser(user.id);
  },
});

export { expect };
