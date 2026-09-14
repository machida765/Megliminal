'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { LOCALE_DATE_FORMAT } from '@/lib/i18n/config';
import { getRepository } from '@/lib/data';
import { useComments } from '@/lib/data/hooks';
import { isAdminRole } from '@/lib/auth/roles';
import { PUBLIC_BOARD, SHOW_COMMENTS, SHOW_USER_IDENTITY, isIdentifiableUserId } from '@/lib/auth/public-board';
import type { Comment } from '@/types';

const MAX_LENGTH = 1000;

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { t, locale } = useTranslations();
  const { user, profile } = useAuth();
  const { comments, loading, reload } = useComments(SHOW_COMMENTS ? postId : null);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!SHOW_COMMENTS) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    if (!user && !PUBLIC_BOARD) return;

    setSubmitting(true);
    setError('');
    try {
      await getRepository().addComment(user?.id ?? null, postId, trimmed);
      setBody('');
      await reload();
    } catch {
      setError(t('comment.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold mb-4">
        {t('comment.title')}
        <span className="ml-2 text-sm font-semibold text-quiet">
          {t('comment.count', { count: comments.length })}
        </span>
      </h2>

      {user || PUBLIC_BOARD ? (
        <form onSubmit={handleSubmit} className="rounded-[14px] border border-line bg-surface p-4 mb-5">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comment.placeholder')}
            rows={3}
            maxLength={MAX_LENGTH}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-quiet tabular">
              {body.length} / {MAX_LENGTH}
            </span>
            <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
              {submitting ? t('comment.submitting') : t('comment.submit')}
            </Button>
          </div>
          {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
        </form>
      ) : (
        <div className="rounded-[14px] border border-line bg-surface p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-quiet">{t('comment.loginRequired')}</p>
          <Button asChild size="sm" variant="outline">
            <Link href={`/login?redirect=/post/${postId}`}>{t('comment.login')}</Link>
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-quiet">{t('common.loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-quiet py-6 text-center">{t('comment.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
              canManage={
                Boolean(comment.userId && comment.userId === user?.id) ||
                isAdminRole(profile?.role)
              }
              canEdit={Boolean(comment.userId && comment.userId === user?.id)}
              onChanged={reload}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface CommentItemProps {
  comment: Comment;
  locale: keyof typeof LOCALE_DATE_FORMAT;
  canManage: boolean;
  canEdit: boolean;
  onChanged: () => Promise<void>;
}

function CommentItem({
  comment,
  locale,
  canManage,
  canEdit,
  onChanged,
}: CommentItemProps) {
  const { t } = useTranslations();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    LOCALE_DATE_FORMAT[locale],
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setBusy(true);
    setError('');
    try {
      await getRepository().updateComment(comment.id, trimmed);
      setEditing(false);
      await onChanged();
    } catch {
      setError(t('comment.updateFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('comment.deleteConfirm'))) return;

    setBusy(true);
    setError('');
    try {
      await getRepository().deleteComment(comment.id);
      await onChanged();
    } catch {
      setError(t('comment.deleteFailed'));
      setBusy(false);
    }
  };

  return (
    <li className="rounded-[14px] border border-line bg-surface p-4">
      <div className="flex items-center gap-2.5 mb-2">
        {SHOW_USER_IDENTITY ? (
          <UserAvatar
            userId={comment.user.id}
            name={comment.user.name}
            avatarUrl={comment.user.avatarUrl}
            className="w-7 h-7"
          />
        ) : null}
        {SHOW_USER_IDENTITY ? (
          isIdentifiableUserId(comment.userId) ? (
          <Link
            href={`/profile/${comment.userId}`}
            className="font-semibold text-sm text-ink hover:text-brand"
          >
            {comment.user.name}
          </Link>
          ) : (
          <span className="font-semibold text-sm text-ink">{comment.user.name}</span>
          )
        ) : null}
        <span className="text-xs text-quiet">{formattedDate}</span>
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={MAX_LENGTH}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={handleSave}>
              {busy ? t('comment.saving') : t('comment.save')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(comment.body);
                setEditing(false);
                setError('');
              }}
            >
              {t('comment.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
          {comment.body}
        </p>
      )}

      {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}

      {canManage && !editing ? (
        <div className="mt-3 flex gap-3 text-xs font-bold">
          {canEdit ? (
            <button
              type="button"
              className="text-quiet hover:text-brand"
              onClick={() => setEditing(true)}
            >
              {t('comment.edit')}
            </button>
          ) : null}
          <button
            type="button"
            className="text-[#9b2c1f] hover:underline"
            disabled={busy}
            onClick={handleDelete}
          >
            {t('comment.delete')}
          </button>
        </div>
      ) : null}
    </li>
  );
}
