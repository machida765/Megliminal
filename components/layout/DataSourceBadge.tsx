'use client';

import { getDataSourceKind, getDataSourceLabel } from '@/lib/config/data-source';

const STYLES = {
  docker: 'bg-[#dbeafe] text-[#1e40af]',
  cloud: 'bg-[#ffedd5] text-[#9a3412]',
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
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-black tracking-wide rotate-3 ${STYLES[kind]}`}
      title={TITLES[kind]}
    >
      {label}
    </span>
  );
}
