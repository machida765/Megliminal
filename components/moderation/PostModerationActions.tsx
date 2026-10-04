'use client';

import { useState } from 'react';
import { Flag, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { getOrCreateReporterKey } from '@/lib/auth/reporter-key';
import { PUBLIC_BOARD } from '@/lib/auth/public-board';
import { getRepository } from '@/lib/data';
import { useInvalidate } from '@/lib/data/hooks';
import { type ReportReason } from '@/types';

interface PostModerationActionsProps {
  postId: string;
  onHidden?: () => void;
}

export function PostModerationActions({
  postId,
  onHidden,
}: PostModerationActionsProps) {
  const { t, messages } = useTranslations();
  const { user, profile } = useAuth();
  const invalidate = useInvalidate();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason>('inappropriate');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // ログイン状態に関わらず常に通報機能を表示
  const canReport = true;
  const isAdmin = profile?.role === 'admin';

  const reasonLabels = messages.report.reason;
  const selectedReasonLabel = reasonLabels[reason];

  const handleReport = async () => {
    setSubmitting(true);
    setReportError('');
    try {
      const reporter = user
        ? { userId: user.id }
        : { key: getOrCreateReporterKey() };
      await getRepository().reportPost(
        postId,
        reason,
        detail || undefined,
        reporter
      );
      setShowReport(false);
      setDetail('');
      alert(t('report.submitted'));
    } catch {
      setReportError(t('report.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = async () => {
    if (!user) return;
    if (!confirm(t('report.hideConfirm'))) {
      return;
    }
    await getRepository().hidePost(user.id, postId);
    invalidate('posts', 'post');
    onHidden?.();
  };

  const handleAdminDelete = async () => {
    if (!isAdmin) return;
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }
    setDeleting(true);
    try {
      await getRepository().deletePost(postId);
      invalidate('posts', 'post');
      onHidden?.();
    } catch {
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-gray-600"
          onClick={() => setShowReport((v) => !v)}
        >
          <Flag className="w-4 h-4" />
          {t('report.report')}
        </Button>
        {user ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-gray-600"
            onClick={handleHide}
          >
            <EyeOff className="w-4 h-4" />
            {t('report.hide')}
          </Button>
        ) : null}
        {isAdmin ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:bg-red-50"
            disabled={deleting}
            onClick={handleAdminDelete}
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? '削除中...' : '削除'}
          </Button>
        ) : null}
      </div>

      {showReport && (
        <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-orange-950">{t('report.reasonLabel')}</p>
          <Select
            value={reason}
            onValueChange={(v) => setReason((v ?? 'other') as ReportReason)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue>{selectedReasonLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(reasonLabels) as [ReportReason, string][]).map(
                ([key, label]) => (
                  <SelectItem key={key} value={key} label={label}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={t('report.detailPlaceholder')}
            rows={3}
            className="bg-white"
          />
          {reportError ? (
            <p className="text-xs text-red-600">{reportError}</p>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={handleReport}
            >
              {submitting ? t('report.submitting') : t('report.submit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowReport(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
