'use client';

import { getDataSourceLabel } from '@/lib/config/data-source';

/** 開発中: 現在のデータソースを表示 */
export function DataSourceBadge() {
  if (process.env.NODE_ENV === 'production') return null;

  const label = getDataSourceLabel();
  const isLocal = label === 'Local';

  return (
    <span
      className={`hidden sm:inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-black tracking-wide rotate-3 ${
        isLocal
          ? 'bg-[#d1fae5] text-[#065f46]'
          : 'bg-[#e0f2fe] text-[#075985]'
      }`}
      title="NEXT_PUBLIC_DATA_SOURCE で切り替え"
    >
      {label}
    </span>
  );
}
