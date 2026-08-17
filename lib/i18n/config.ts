import type { Locale } from '@/messages';

/** デフォルト表示言語 */
export const DEFAULT_LOCALE: Locale = 'ja';

/** html lang 属性用 */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  ja: 'ja',
  en: 'en',
};

/** Intl 日付フォーマット用 */
export const LOCALE_DATE_FORMAT: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};
