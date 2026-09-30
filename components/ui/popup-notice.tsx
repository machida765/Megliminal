'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/components/providers/LocaleProvider';

type PopupNoticeProps = {
  title: string;
  message: string;
  onClose: () => void;
};

export function PopupNotice({ title, message, onClose }: PopupNoticeProps) {
  const { t } = useTranslations();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="popup-notice-title"
        aria-describedby="popup-notice-message"
        className="relative z-[1] w-full max-w-[360px] rounded-[18px] border border-line bg-surface p-5 shadow-[0_18px_50px_rgba(40,24,16,0.22)]"
      >
        <h2 id="popup-notice-title" className="text-base font-semibold text-ink">
          {title}
        </h2>
        <p id="popup-notice-message" className="mt-2 text-sm leading-relaxed text-quiet">
          {message}
        </p>
        <div className="mt-5 flex justify-end">
          <Button type="button" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
