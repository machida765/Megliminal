import type { Metadata } from 'next';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '@/lib/legal/terms-sections';
import { APP_NAME } from '@/lib/config/app';
import { getMessages } from '@/messages';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const messages = getMessages(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${messages.legal.terms} | ${APP_NAME}`,
  description: messages.legal.termsDescription,
};

export default function TermsPage() {
  return (
    <LegalPageShell title={messages.legal.terms} backLabel={messages.common.backToHome}>
      <p className="text-xs text-brand -mt-4 mb-2">最終更新: {TERMS_LAST_UPDATED}</p>
      <p className="text-quiet text-sm">
        本ページはドラフトです。本番公開前に内容を確認・必要に応じて法律専門家へご相談ください。
      </p>
      {TERMS_SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </LegalSection>
      ))}
    </LegalPageShell>
  );
}
