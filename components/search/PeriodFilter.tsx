'use client';

import type { RankingPeriod } from '@/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/components/providers/LocaleProvider';

interface PeriodFilterProps {
  value: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
}

const PERIODS: RankingPeriod[] = ['all', 'month', 'week'];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { messages } = useTranslations();

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
          {messages.ranking.period[period]}
        </Button>
      ))}
    </div>
  );
}
