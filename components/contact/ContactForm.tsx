'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { CONTACT_KINDS, type ContactKind } from '@/lib/contact/schema';
import { cn } from '@/lib/utils';

const MESSAGE_MAX = 2000;

export function ContactForm() {
  const { t } = useTranslations();
  const { user, profile, loading } = useAuth();
  const [kind, setKind] = useState<ContactKind>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactTrap, setContactTrap] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (loading || prefilled) return;
    if (user?.email) setEmail(user.email);
    if (profile?.name) setName(profile.name);
    setPrefilled(true);
  }, [loading, prefilled, profile?.name, user?.email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedEmail || !trimmedMessage) {
      setErrorMessage(t('contact.errors.required'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage(t('contact.errors.invalid_email'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          name: name.trim(),
          email: trimmedEmail,
          message: trimmedMessage,
          contactTrap,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        const code = payload?.error;
        if (code === 'rate_limited' || code === 'invalid_body' || code === 'unavailable') {
          setErrorMessage(t(`contact.errors.${code}`));
        } else {
          setErrorMessage(t('contact.errors.unavailable'));
        }
        return;
      }

      setSent(true);
    } catch {
      setErrorMessage(t('contact.errors.network'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4" role="status">
        <p className="font-semibold text-ink">{t('contact.successTitle')}</p>
        <p className="text-quiet">{t('contact.successBody')}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSent(false);
            setMessage('');
            setErrorMessage('');
          }}
        >
          {t('contact.another')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5" noValidate>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink">
          {t('contact.kindLabel')} <span className="text-brand">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONTACT_KINDS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={kind === item}
              onClick={() => setKind(item)}
              className={cn(
                'rounded-[14px] border px-3 py-2 text-sm font-semibold transition-colors',
                kind === item
                  ? 'border-brand bg-brand text-brand-ink'
                  : 'border-line bg-surface text-quiet hover:text-ink'
              )}
            >
              {t(`contact.kinds.${item}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="contact-name" className="block text-sm font-semibold text-ink">
          {t('contact.nameLabel')}{' '}
          <span className="text-xs font-normal text-quiet">({t('common.optional')})</span>
        </label>
        <Input
          id="contact-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('contact.namePlaceholder')}
          maxLength={80}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="block text-sm font-semibold text-ink">
          {t('contact.emailLabel')} <span className="text-brand">*</span>
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('contact.emailPlaceholder')}
          maxLength={254}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="block text-sm font-semibold text-ink">
          {t('contact.messageLabel')} <span className="text-brand">*</span>
        </label>
        <Textarea
          id="contact-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('contact.messagePlaceholder')}
          maxLength={MESSAGE_MAX}
          required
          className="min-h-[160px]"
        />
        <p className="text-xs text-quiet">
          {message.length} / {MESSAGE_MAX}
        </p>
      </div>

      <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
        <label>
          Fax
          <input
            tabIndex={-1}
            autoComplete="off"
            value={contactTrap}
            onChange={(event) => setContactTrap(event.target.value)}
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? t('contact.submitting') : t('contact.submit')}
      </Button>
    </form>
  );
}
