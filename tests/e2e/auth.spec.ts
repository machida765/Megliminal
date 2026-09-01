import { expect, login, loginSubmitButton, submitLogin, test } from './fixtures';

test.describe('認証フロー', () => {
  test('未ログインでもトップページは見られる', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
  });

  test.describe('未ログインでの保護ページ', () => {
    for (const path of ['/create', '/bookmarks', '/profile/edit', '/settings', '/admin']) {
      test(`${path} はログインへ飛ばされる`, async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveURL(/\/login/);
      });
    }
  });

  test('パスワードが違うとエラーが出てログインできない', async ({ page, user }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', 'wrong-password');
    await loginSubmitButton(page).click();

    await expect(
      page.getByText('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('メールとパスワードが空だと送信されない', async ({ page }) => {
    await page.goto('/login');
    await loginSubmitButton(page).click();

    await expect(
      page.getByText('メールアドレスとパスワードを入力してください')
    ).toBeVisible();
  });

  test('正しい資格情報でログインするとトップに戻る', async ({ page, user }) => {
    await login(page, user);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'ログイン' })).toHaveCount(0);
  });

  test('redirect パラメータの遷移先に戻る', async ({ page, user }) => {
    await page.goto('/create');
    await expect(page).toHaveURL(/redirect=%2Fcreate|redirect=\/create/);

    await submitLogin(page, user);

    await expect(page).toHaveURL(/\/create/);
  });

  test('外部サイトへの redirect は無視される', async ({ page, user }) => {
    await page.goto('/login?redirect=https://example.com/evil');
    await submitLogin(page, user);

    await expect(page).toHaveURL(/127\.0\.0\.1|localhost/);
    await expect(page).not.toHaveURL(/example\.com/);
  });

  test('ログアウトすると保護ページに入れなくなる', async ({ page, user }) => {
    await login(page, user);

    await page.goto(`/profile/${user.id}`);
    await page.getByRole('button', { name: '退出' }).click();
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();

    await page.goto('/create');
    await expect(page).toHaveURL(/\/login/);
  });

  test('一般ユーザーは管理画面に入れない', async ({ page, user }) => {
    await login(page, user);
    await page.goto('/admin');

    await expect(page).toHaveURL(/error=forbidden/);
  });
});
