'use client';

/** 言語。画面の文言は useTranslations() の t('キー')。正本は messages/ja.ts。 */
import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { createTranslator, type TranslateFn } from '@/lib/i18n/translate';
import { getMessages, type Locale, type Messages } from '@/messages';

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: React.ReactNode;
  locale?: Locale;
};

export function LocaleProvider({
  children,
  locale = DEFAULT_LOCALE,
}: LocaleProviderProps) {
  const value = useMemo(() => {
    const messages = getMessages(locale);
    return {
      locale,
      messages,
      t: createTranslator(messages),
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** クライアントコンポーネントで UI 文言を取得 */
export function useTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslations must be used within LocaleProvider');
  }
  return context;
}
