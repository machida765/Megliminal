import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { createTranslator } from '@/lib/i18n/translate';
import { getMessages } from '@/messages';

/** 認証エラー文言（LocaleProvider 外でも使える） */
export function getAuthTranslator(locale = DEFAULT_LOCALE) {
  return createTranslator(getMessages(locale));
}
