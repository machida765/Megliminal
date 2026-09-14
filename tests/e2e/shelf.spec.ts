import { expect, test } from './fixtures';

test('本棚は非公開（ナビなし・URLは404）', async ({ page }) => {
  const response = await page.goto('/shelf');
  expect(response?.status()).toBe(404);

  await page.goto('/');
  await expect(page.getByRole('link', { name: '本棚' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '本棚を歩く' })).toHaveCount(0);
});
