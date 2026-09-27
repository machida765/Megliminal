import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { APP_NAME } from '@/lib/config/app';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getMessages } from '@/messages';

const messages = getMessages(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${messages.contact.title} | ${APP_NAME}`,
  description: messages.contact.description,
};

export default function ContactPage() {
  return (
    <LegalPageShell title={messages.contact.title} backLabel={messages.common.backToHome}>
      <p className="text-quiet text-sm -mt-4">{messages.contact.intro}</p>
      <ContactForm />
    </LegalPageShell>
  );
}
