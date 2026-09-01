'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import {
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  hasEmailPasswordIdentity,
} from '@/lib/auth/account';
import { createClient } from '@/lib/supabase/client';

type DeleteErrorCode =
  | 'unauthorized'
  | 'invalid_password'
  | 'password_required'
  | 'confirm_phrase_required'
  | 'delete_failed'
  | 'service_unavailable'
  | 'network';

export function DeleteAccountSection() {
  const router = useRouter();
  const { t } = useTranslations();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<DeleteErrorCode | null>(null);
  const [requiresPassword, setRequiresPassword] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    const loadAuthMethod = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      setRequiresPassword(authUser ? hasEmailPasswordIdentity(authUser) : false);
    };

    void loadAuthMethod();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!user) return null;

  const handleDelete = async () => {
    setErrorCode(null);

    if (!acknowledged) {
      setErrorCode('confirm_phrase_required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim() || undefined,
          confirmPhrase: confirmPhrase.trim() || undefined,
        }),
      });

      const data = (await response.json()) as { error?: DeleteErrorCode };

      if (!response.ok) {
        setErrorCode(data.error ?? 'delete_failed');
        return;
      }

      await signOut();
      router.push('/?deleted=1');
      router.refresh();
    } catch {
      setErrorCode('network');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = errorCode ? t(`settings.delete.errors.${errorCode}`) : null;
  const canSubmit =
    acknowledged &&
    requiresPassword !== null &&
    (requiresPassword ? password.trim().length > 0 : confirmPhrase.trim().length > 0);

  return (
    <section
      id="delete-account"
      className="rounded-2xl border border-[#e8c4b8] bg-[#fff8f6] px-5 py-5 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde8e4] text-[#b42318]">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#7a271a]">{t('settings.delete.title')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#8a5a4c]">
            {t('settings.delete.summary')}
          </p>
        </div>
      </div>

      {!expanded ? (
        <div className="mt-4 pl-0 sm:pl-12">
          <Button
            type="button"
            variant="outline"
            className="border-[#e8b4a8] bg-white text-[#9b2c1f] hover:bg-[#fff1ed]"
            onClick={() => setExpanded(true)}
          >
            {t('settings.delete.submit')}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-4 border-t border-[#f0d4cc] pt-5 sm:pl-12">
          <p className="text-sm leading-relaxed text-[#6a5344]">
            {t('settings.delete.description')}
          </p>
          <ul className="space-y-1.5 text-sm text-[#6a5344]">
            <li className="flex gap-2">
              <span className="text-[#c45c28]">・</span>
              {t('settings.delete.consequenceProfile')}
            </li>
            <li className="flex gap-2">
              <span className="text-[#c45c28]">・</span>
              {t('settings.delete.consequencePosts')}
            </li>
            <li className="flex gap-2">
              <span className="text-[#c45c28]">・</span>
              {t('settings.delete.consequenceIrreversible')}
            </li>
          </ul>

          <label className="flex items-start gap-2.5 text-sm text-[#3b2a22]">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#c45c28]"
            />
            <span>{t('settings.delete.acknowledge')}</span>
          </label>

          {requiresPassword === null ? (
            <p className="text-sm text-gray-500">{t('common.loading')}</p>
          ) : requiresPassword ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#3b2a22]">
                {t('settings.delete.passwordLabel')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder={t('settings.delete.passwordPlaceholder')}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#3b2a22]">
                {t('settings.delete.confirmPhraseLabel', {
                  phrase: DELETE_ACCOUNT_CONFIRM_PHRASE,
                })}
              </label>
              <Input
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder={DELETE_ACCOUNT_CONFIRM_PHRASE}
              />
            </div>
          )}

          {errorMessage ? <p className="text-sm text-[#b42318]">{errorMessage}</p> : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setExpanded(false);
                setErrorCode(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-[#c9372c] shadow-none hover:bg-[#b42318] focus-visible:ring-red-300"
              disabled={isSubmitting || !canSubmit}
              onClick={handleDelete}
            >
              {isSubmitting ? t('settings.delete.submitting') : t('settings.delete.submit')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
