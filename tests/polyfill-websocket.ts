/**
 * @supabase/supabase-js はクライアント生成時に WebSocket を要求するが、
 * Node.js 22 未満にはグローバル WebSocket が無い。テスト実行時だけ undici で補う。
 */
export {};

if (typeof globalThis.WebSocket === 'undefined') {
  const { WebSocket } = await import('undici');
  Object.defineProperty(globalThis, 'WebSocket', {
    value: WebSocket,
    configurable: true,
    writable: true,
  });
}
