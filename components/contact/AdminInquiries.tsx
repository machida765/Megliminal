'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { LOCALE_DATE_FORMAT } from '@/lib/i18n/config';
import type { ContactKind } from '@/lib/contact/schema';
import { cn } from '@/lib/utils';

type InquiryStatus = 'open' | 'closed';

type InquiryRow = {
  id: string;
  kind: ContactKind;
  name: string | null;
  email: string;
  message: string;
  status: InquiryStatus;
  user_id: string | null;
  created_at: string;
};

export function AdminInquiries() {
  const { t, locale } = useTranslations();
  const [status, setStatus] = useState<InquiryStatus>('open');
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, kind, name, email, message, status, user_id, created_at')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      setRows([]);
      setErrorMessage(t('admin.inquiries.loadFailed'));
    } else {
      setRows((data ?? []) as InquiryRow[]);
    }
    setLoading(false);
  }, [status, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateStatus = async (row: InquiryRow, next: InquiryStatus) => {
    setUpdatingId(row.id);
    setErrorMessage('');
    const supabase = createClient();
    const { error } = await supabase
      .from('inquiries')
      .update({ status: next })
      .eq('id', row.id);

    setUpdatingId(null);
    if (error) {
      setErrorMessage(t('admin.inquiries.updateFailed'));
      return;
    }
    setRows((current) => current.filter((item) => item.id !== row.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['open', 'closed'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              status === item
                ? 'bg-brand text-brand-ink'
                : 'text-quiet hover:bg-soft hover:text-ink'
            )}
          >
            {t(`admin.inquiries.${item}`)}
          </button>
        ))}
      </div>

      {errorMessage ? (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-quiet">{t('common.loading')}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-quiet">
          {status === 'open' ? t('admin.inquiries.emptyOpen') : t('admin.inquiries.emptyClosed')}
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const when = new Date(row.created_at).toLocaleString(LOCALE_DATE_FORMAT[locale], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const busy = updatingId === row.id;
            return (
              <li key={row.id} className="rounded-[14px] border border-line bg-surface px-4 py-4 space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quiet">
                  <span className="rounded-full bg-soft px-2 py-0.5 font-semibold text-brand">
                    {t(`contact.kinds.${row.kind}`)}
                  </span>
                  <time dateTime={row.created_at}>{when}</time>
                  {row.user_id ? <span>{t('admin.inquiries.fromUser')}</span> : null}
                </div>
                <p className="text-sm text-ink">
                  {row.name ? <span className="font-semibold">{row.name}</span> : null}
                  {row.name ? <span className="text-quiet"> · </span> : null}
                  <a href={`mailto:${row.email}`} className="underline underline-offset-2 hover:text-brand">
                    {row.email}
                  </a>
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                  {row.message}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => updateStatus(row, row.status === 'open' ? 'closed' : 'open')}
                  className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                >
                  {busy
                    ? t('admin.inquiries.updating')
                    : row.status === 'open'
                      ? t('admin.inquiries.markClosed')
                      : t('admin.inquiries.reopen')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
