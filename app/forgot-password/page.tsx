import { notFound } from 'next/navigation';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getMessages } from '@/messages';

export default function ForgotPasswordPage() {
  if (PUBLIC_BOARD) notFound();

  const messages = getMessages(DEFAULT_LOCALE);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">
          {messages.auth.forgotPassword.title}
        </h1>
        <p className="text-quiet">{messages.auth.forgotPassword.pageSubtitle}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
