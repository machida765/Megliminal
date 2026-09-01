type SupabaseServiceEnv = {
  url: string;
  serviceRoleKey: string;
};

/** サーバー専用。service_role key はクライアントに載せない。 */
export function getSupabaseServiceEnv(): SupabaseServiceEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です。'
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が正しいURLではありません。');
  }

  if (serviceRoleKey.length < 20) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY が不正です。');
  }

  return { url: parsedUrl.origin, serviceRoleKey };
}
