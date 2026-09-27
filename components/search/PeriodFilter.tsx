'use client';

import type { RankingPeriod } from '@/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { RANKING_PERIODS } from '@/lib/ranking';

interface PeriodFilterProps {
  value: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { messages } = useTranslations();

  return (
    <div className="flex flex-wrap gap-2">
      {RANKING_PERIODS.map((period) => (
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
