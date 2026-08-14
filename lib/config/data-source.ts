export type DataSource = 'local' | 'supabase';

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

export function getDataSourceLabel(): string {
  return getDataSource() === 'local' ? 'Local' : 'Supabase';
}
