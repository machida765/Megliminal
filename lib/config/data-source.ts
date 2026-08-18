export type DataSource = 'local' | 'supabase';

export type DataSourceKind = 'local' | 'docker' | 'cloud';

/** データの取得元。画面開発中は `local`、Supabase 接続テスト時は `supabase` */
export function getDataSource(): DataSource {
  const value = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return value === 'supabase' ? 'supabase' : 'local';
}

export function isLocalDataSource(): boolean {
  return getDataSource() === 'local';
}

export function isSupabaseDataSource(): boolean {
  return getDataSource() === 'supabase';
}

function isLocalSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('127.0.0.1') ||
    url.includes('localhost') ||
    url.includes('0.0.0.0')
  );
}

/** Local = ブラウザ内、Docker = PC 上の Supabase、Cloud = ネット上の Supabase */
export function getDataSourceKind(): DataSourceKind {
  if (getDataSource() === 'local') return 'local';
  return isLocalSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    ? 'docker'
    : 'cloud';
}

export function getDataSourceLabel(): string {
  const kind = getDataSourceKind();
  if (kind === 'local') return 'Local';
  if (kind === 'docker') return 'Docker';
  return 'Cloud';
}
