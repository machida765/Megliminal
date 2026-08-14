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
import { getRepository } from '@/lib/data';
import {
  REPORT_REASON_LABELS,
  type ReportReason,
} from '@/types';

interface PostModerationActionsProps {
  postId: string;
  onHidden?: () => void;
}

export function PostModerationActions({
  postId,
  onHidden,
}: PostModerationActionsProps) {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason>('inappropriate');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleReport = async () => {
    setSubmitting(true);
    await getRepository().reportPost(user.id, postId, reason, detail || undefined);
    setSubmitting(false);
    setShowReport(false);
    setDetail('');
    alert('通報を受け付けました。ご協力ありがとうございます。');
  };

  const handleHide = async () => {
    if (!confirm('この投稿を非表示にしますか？（あなたの画面からのみ消えます）')) {
      return;
    }
    await getRepository().hidePost(user.id, postId);
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
          通報
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-gray-600"
          onClick={handleHide}
        >
          <EyeOff className="w-4 h-4" />
          非表示
        </Button>
      </div>

      {showReport && (
        <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-orange-950">通報理由</p>
          <Select
            value={reason}
            onValueChange={(v) => setReason((v ?? 'other') as ReportReason)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REPORT_REASON_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="詳細（任意）"
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
              {submitting ? '送信中...' : '通報する'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowReport(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
