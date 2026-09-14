import { captureDialogs, expect, login, test, type E2EUser } from './fixtures';
import type { Page } from '@playwright/test';
import { PUBLIC_BOARD, SHOW_COMMENTS } from '@/lib/auth/public-board';

/** CategoryPicker（base-ui Select）で最初の大ジャンルを選ぶ */
async function pickFirstMajorCategory(page: Page): Promise<void> {
  await page.getByRole('combobox').first().click();
  await page.getByRole('option').first().click();
}

async function fillPostForm(
  page: Page,
  title: string,
  description: string,
  url?: string
): Promise<void> {
  await page.goto('/create');
  await pickFirstMajorCategory(page);
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="description"]', description);
  if (url) await page.fill('input[name="url"]', url);
}

async function createPost(
  page: Page,
  title: string,
  description: string,
  url?: string
): Promise<void> {
  await fillPostForm(page, title, description, url);
  await page.getByRole('button', { name: '投稿する' }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** プロフィールから投稿詳細を開き、詳細ページの URL を返す */
async function openPost(page: Page, user: E2EUser, title: string): Promise<string> {
  await page.goto(`/profile/${user.id}`);
  await page.getByRole('link', { name: new RegExp(title) }).first().click();
  // 一覧側もタイトルを見出しで描くため、URL の遷移完了まで待ってから取得する
  await expect(page).toHaveURL(/\/post\/[^/]+$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  return page.url();
}

test.describe('投稿 CRUD', () => {
  let dialogs: string[];

  test.beforeEach(async ({ page }) => {
    dialogs = captureDialogs(page);
  });

  test('未ログインでも投稿・コメント・いいねできる', async ({ page }) => {
    const title = `E2E 匿名 ${Date.now()}`;
    await createPost(page, title, '匿名で書いた説明文です。');

    await page.goto(`/search?q=${encodeURIComponent(title)}`);
    await page.getByRole('link', { name: new RegExp(title) }).first().click();
    await expect(page).toHaveURL(/\/post\/[^/]+$/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByText('匿名', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '編集する' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '削除する' })).toHaveCount(0);

    const main = page.getByRole('main');
    await main.getByRole('button', { name: /いいね/ }).click();
    await expect(main.getByRole('button', { name: /1 いいね/ })).toBeVisible();

    await page.fill('textarea', '匿名コメントです。');
    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('匿名コメントです。')).toBeVisible();
  });

  test('投稿を作成すると詳細ページに出る', async ({ page, user }) => {
    test.skip(PUBLIC_BOARD, 'ログインページはいったん非公開');
    const title = `E2E 作成 ${Date.now()}`;
    await login(page, user);
    await createPost(page, title, 'E2E で作成した投稿の説明文です。', 'https://example.com');

    await openPost(page, user, title);
    await expect(page.getByText('E2E で作成した投稿の説明文です。')).toBeVisible();
  });

  test('必須項目が空だと投稿できない', async ({ page }) => {
    await page.goto('/create');
    await page.getByRole('button', { name: '投稿する' }).click();

    await expect
      .poll(() => dialogs.join('\n'))
      .toContain('必須項目を入力してください');
    await expect(page).toHaveURL(/\/create/);
  });

  test('同じ大ジャンルには週に1回しか投稿できない', async ({ page, user }) => {
    test.skip(PUBLIC_BOARD, 'ログインページはいったん非公開');
    await login(page, user);
    await createPost(page, `E2E 1本目 ${Date.now()}`, '1本目の説明文です。');

    await fillPostForm(page, 'E2E 2本目', '2本目の説明文です。');
    await page.getByRole('button', { name: '投稿する' }).click();

    await expect.poll(() => dialogs.join('\n')).toContain('あと');
    await expect(page).toHaveURL(/\/create/);
  });

  test('投稿を編集できる', async ({ page, user }) => {
    test.skip(PUBLIC_BOARD, 'ログインページはいったん非公開');
    const title = `E2E 編集前 ${Date.now()}`;
    const updatedTitle = `${title} 更新済み`;

    await login(page, user);
    await createPost(page, title, '編集前の説明文です。');
    await openPost(page, user, title);

    await page.getByRole('link', { name: '編集する' }).click();
    await page.fill('input[name="title"]', updatedTitle);
    await page.fill('textarea[name="description"]', '編集後の説明文です。');
    await page.getByRole('button', { name: '更新する' }).click();

    await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();
    await expect(page.getByText('編集後の説明文です。')).toBeVisible();
  });

  test('投稿を削除できる', async ({ page, user }) => {
    test.skip(PUBLIC_BOARD, 'ログインページはいったん非公開');
    const title = `E2E 削除 ${Date.now()}`;

    await login(page, user);
    await createPost(page, title, '削除される投稿の説明文です。');
    const postUrl = await openPost(page, user, title);

    await page.getByRole('button', { name: '削除する' }).click();
    // 削除後は onDeleted でプロフィールへ遷移する。この遷移が終わる前に
    // page.goto すると削除リクエストや遷移とぶつかるので、描画まで待つ。
    await expect(page).toHaveURL(new RegExp(`/profile/${user.id}`));
    await expect(page.getByText('まだ投稿がありません')).toBeVisible();

    await page.goto(postUrl);
    await expect(page.getByText('投稿が見つかりません')).toBeVisible();
  });

  test('他人の投稿には編集・削除ボタンが出ない', async ({ page, browser, user }) => {
    test.skip(PUBLIC_BOARD, 'ログインページはいったん非公開');
    const title = `E2E 他人の投稿 ${Date.now()}`;
    await login(page, user);
    await createPost(page, title, '他人から見える投稿の説明文です。');
    const postUrl = await openPost(page, user, title);

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(postUrl);

    await expect(guestPage.getByRole('heading', { name: title })).toBeVisible();
    await expect(guestPage.getByRole('link', { name: '編集する' })).toHaveCount(0);
    await expect(guestPage.getByRole('button', { name: '削除する' })).toHaveCount(0);

    await guestContext.close();
  });

  test('いいね・保存・コメントができる', async ({ page, user }) => {
    test.skip(PUBLIC_BOARD || !SHOW_COMMENTS, 'ログイン・コメントはいったん非公開');
    const title = `E2E 交流 ${Date.now()}`;
    await login(page, user);
    await createPost(page, title, '交流テスト用の説明文です。');
    await openPost(page, user, title);

    const main = page.getByRole('main');

    await main.getByRole('button', { name: /いいね/ }).click();
    await expect(main.getByRole('button', { name: /1 いいね/ })).toBeVisible();

    await main.getByRole('button', { name: '保存', exact: true }).click();
    await expect(main.getByRole('button', { name: '保存済み' })).toBeVisible();

    await page.fill('textarea', 'E2E のコメントです。');
    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('E2E のコメントです。')).toBeVisible();

    await page.goto('/bookmarks');
    await expect(page.getByText(title)).toBeVisible();
  });
});
