'use client';

import { getDataSourceKind, getDataSourceLabel } from '@/lib/config/data-source';

const STYLES = {
  docker: 'bg-soft text-ink',
  cloud: 'bg-pop/30 text-brand',
} as const;

const TITLES = {
  docker: 'PC 上の Docker / ローカル Supabase',
  cloud: 'ネット上の Supabase（クラウド）',
} as const;

/** 開発中: Docker か Cloud かを表示 */
export function DataSourceBadge() {
  const kind = getDataSourceKind();
  const label = getDataSourceLabel();

  if (process.env.NODE_ENV === 'production' && kind === 'cloud') {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${STYLES[kind]}`}
      title={TITLES[kind]}
    >
      {label}
    </span>
  );
}
