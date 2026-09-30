/** クライアントからトップの ISR キャッシュを破棄する */
export async function revalidateHomePage(): Promise<void> {
  try {
    await fetch('/api/revalidate-home', { method: 'POST' });
  } catch {
    // 投稿自体は成功しているので、キャッシュ破棄の失敗は握りつぶす
  }
}
