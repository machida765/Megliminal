'use client';

import { RANKING_PERIOD_LABELS, type RankingPeriod } from '@/types';
import { Button } from '@/components/ui/button';

interface PeriodFilterProps {
  value: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
}

const PERIODS: RankingPeriod[] = ['all', 'month', 'week'];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((period) => (
        <Button
          key={period}
          type="button"
          size="sm"
          variant={value === period ? 'flat' : 'flat-outline'}
          onClick={() => onChange(period)}
        >
          {RANKING_PERIOD_LABELS[period]}
        </Button>
      ))}
    </div>
  );
}
