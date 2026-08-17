'use client';

import type { RankingPeriod } from '@/types';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/search/DatePicker';
import { useTranslations } from '@/components/providers/LocaleProvider';
import type { TranslateFn } from '@/lib/i18n/translate';

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
  const { t, messages } = useTranslations();
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
        <p className="text-xs text-[#8a6a52] mb-2">{t('period.preset')}</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PERIODS.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={!hasCustomRange && period === p ? 'flat' : 'flat-outline'}
              onClick={() => handlePeriodChange(p)}
            >
              {messages.ranking.period[p]}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#8a6a52] mb-2">{t('period.calendar')}</p>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <DatePicker value={dateFrom} onChange={setDateFrom} aria-label={t('date.start')} />
          <span className="text-sm text-[#8a6a52] text-center shrink-0 sm:pt-2">
            {t('period.rangeSeparator')}
          </span>
          <DatePicker value={dateTo} onChange={setDateTo} aria-label={t('date.end')} />
          {hasCustomRange && (
            <Button
              type="button"
              size="sm"
              variant="flat-outline"
              className="shrink-0 sm:mt-0.5"
              onClick={clearCustomRange}
            >
              {t('common.clearSelection')}
            </Button>
          )}
        </div>
        <p className="text-xs text-[#8a6a52] mt-1.5">{t('period.calendarHint')}</p>
      </div>
    </div>
  );
}

function formatSlash(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export function formatSearchDateRangeLabel(
  dateFrom: string | null,
  dateTo: string | null,
  t: TranslateFn
): string | null {
  if (!dateFrom && !dateTo) return null;

  if (dateFrom && dateTo) {
    return t('search.dateRange.between', {
      from: formatSlash(dateFrom),
      to: formatSlash(dateTo),
    });
  }
  if (dateFrom) {
    return t('search.dateRange.after', { date: formatSlash(dateFrom) });
  }
  return t('search.dateRange.before', { date: formatSlash(dateTo!) });
}
