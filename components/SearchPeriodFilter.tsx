'use client';

import { RANKING_PERIOD_LABELS, type RankingPeriod } from '@/types';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/DatePicker';

type SearchPeriodFilterProps = {
  period: RankingPeriod;
  dateFrom: string | null;
  dateTo: string | null;
  onPeriodChange: (period: RankingPeriod) => void;
  onDateFromChange: (value: string | null) => void;
  onDateToChange: (value: string | null) => void;
};

const PRESET_PERIODS: RankingPeriod[] = ['all', 'month', 'week'];

export function SearchPeriodFilter({
  period,
  dateFrom,
  dateTo,
  onPeriodChange,
  onDateFromChange,
  onDateToChange,
}: SearchPeriodFilterProps) {
  const hasCustomRange = Boolean(dateFrom || dateTo);

  const handlePeriodChange = (next: RankingPeriod) => {
    onPeriodChange(next);
    if (next !== 'all') {
      onDateFromChange(null);
      onDateToChange(null);
    }
  };

  const setDateFrom = (next: string | null) => {
    onDateFromChange(next);
    if (next) onPeriodChange('all');
    if (next && dateTo && next > dateTo) onDateToChange(next);
  };

  const setDateTo = (next: string | null) => {
    onDateToChange(next);
    if (next) onPeriodChange('all');
    if (next && dateFrom && next < dateFrom) onDateFromChange(next);
  };

  const clearCustomRange = () => {
    onDateFromChange(null);
    onDateToChange(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-[#8a6a52] mb-2">おおよその期間</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PERIODS.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={!hasCustomRange && period === p ? 'flat' : 'flat-outline'}
              onClick={() => handlePeriodChange(p)}
            >
              {RANKING_PERIOD_LABELS[p]}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#8a6a52] mb-2">カレンダーで指定</p>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            aria-label="開始日"
          />
          <span className="text-sm text-[#8a6a52] text-center shrink-0 sm:pt-2">〜</span>
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            aria-label="終了日"
          />
          {hasCustomRange && (
            <Button
              type="button"
              size="sm"
              variant="flat-outline"
              className="shrink-0 sm:mt-0.5"
              onClick={clearCustomRange}
            >
              指定を解除
            </Button>
          )}
        </div>
        <p className="text-xs text-[#8a6a52] mt-1.5">
          入力欄をクリックしてカレンダーから選べます。開始だけ・終了だけの指定も可能です。
        </p>
      </div>
    </div>
  );
}

export function formatSearchDateRangeLabel(
  dateFrom: string | null,
  dateTo: string | null
): string | null {
  if (!dateFrom && !dateTo) return null;

  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${y}/${m}/${d}`;
  };

  if (dateFrom && dateTo) return `${fmt(dateFrom)} 〜 ${fmt(dateTo)}`;
  if (dateFrom) return `${fmt(dateFrom)} 以降`;
  return `${fmt(dateTo!)} 以前`;
}
