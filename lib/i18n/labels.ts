import { getMessages, type Locale } from '@/messages';
import type { RankingPeriod, ReportReason } from '@/types';
import type { SearchSort } from '@/lib/search';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

export function getRankingPeriodLabels(locale: Locale = DEFAULT_LOCALE) {
  return getMessages(locale).ranking.period satisfies Record<RankingPeriod, string>;
}

export function getReportReasonLabels(locale: Locale = DEFAULT_LOCALE) {
  return getMessages(locale).report.reason satisfies Record<ReportReason, string>;
}

export function getSearchSortLabels(locale: Locale = DEFAULT_LOCALE) {
  return getMessages(locale).search.sort satisfies Record<SearchSort, string>;
}
