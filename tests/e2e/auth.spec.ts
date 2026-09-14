import { expect, test } from './fixtures';

test.describe('認証フロー', () => {
  test('未ログインでもトップページは見られる', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: '投稿する' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ログイン' })).toHaveCount(0);
  });

  test('ログイン関連ページは非公開（404）', async ({ page }) => {
    for (const path of ['/login', '/signup', '/forgot-password', '/reset-password']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test.describe('未ログインでの保護ページ', () => {
    for (const path of ['/bookmarks', '/profile/edit', '/settings']) {
      test(`${path} はホームへ戻される`, async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveURL(/\/$/);
        await expect(page).not.toHaveURL(/\/login/);
      });
    }

    test('/admin は管理者ログインへ誘導される', async ({ page }) => {
      await page.goto('/admin/reports');
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('/admin/login は表示できる', async ({ page }) => {
      const response = await page.goto('/admin/login');
      expect(response?.status()).toBe(200);
    });
  });
});
