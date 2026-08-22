export type DataSourceKind = 'docker' | 'cloud';

function isLocalSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('127.0.0.1') ||
    url.includes('localhost') ||
    url.includes('0.0.0.0')
  );
}

/** Docker = PC 上の Supabase、Cloud = ネット上の Supabase */
export function getDataSourceKind(): DataSourceKind {
  return isLocalSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    ? 'docker'
    : 'cloud';
}

export function getDataSourceLabel(): string {
  return getDataSourceKind() === 'docker' ? 'Docker' : 'Cloud';
}
