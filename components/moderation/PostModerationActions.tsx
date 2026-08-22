'use client';

import { useState } from 'react';
import { Flag, EyeOff } from 'lucide-react';
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
  const { user } = useAuth();
  const invalidate = useInvalidate();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason>('inappropriate');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const reasonLabels = messages.report.reason;
  const selectedReasonLabel = reasonLabels[reason];

  const handleReport = async () => {
    setSubmitting(true);
    await getRepository().reportPost(user.id, postId, reason, detail || undefined);
    setSubmitting(false);
    setShowReport(false);
    setDetail('');
    alert(t('report.submitted'));
  };

  const handleHide = async () => {
    if (!confirm(t('report.hideConfirm'))) {
      return;
    }
    await getRepository().hidePost(user.id, postId);
    invalidate('posts', 'post');
    onHidden?.();
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
