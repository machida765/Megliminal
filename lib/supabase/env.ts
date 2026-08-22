type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

function isServiceRoleKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;

  const payload = key.split('.')[1];
  if (!payload) return false;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as { role?: string };
    return decoded.role === 'service_role';
  } catch {
    return false;
  }
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  // NEXT_PUBLIC_* はブラウザバンドル時に静的置換されるため直接参照する。
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が必要です。'
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が正しいURLではありません。');
  }

  const isLocal =
    parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
  if (parsedUrl.protocol !== 'https:' && !(isLocal && parsedUrl.protocol === 'http:')) {
    throw new Error('Supabase URL はHTTPSを使用してください。');
  }

  if (anonKey.length < 20) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY が不正です。');
  }

  if (isServiceRoleKey(anonKey)) {
    throw new Error('service_role / secret keyを公開環境変数に設定できません。');
  }

  return { url: parsedUrl.origin, anonKey };
}
