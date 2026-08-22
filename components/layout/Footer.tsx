'use client';

import Link from 'next/link';
import { useTranslations } from '@/components/providers/LocaleProvider';

export function Footer() {
  const { t, messages } = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-[3px] border-[#e8c9a4] bg-[#fff1e4]/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-black text-[#3b2a22] hand-title">{messages.app.name}</p>
            <p className="text-xs text-[#b56a38] mt-1">{messages.app.tagline}</p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6a5344]"
            aria-label={t('legal.footerNav')}
          >
            <Link href="/terms" prefetch={false} className="hover:text-[#ef7d3b] underline-offset-2 hover:underline">
              {t('legal.terms')}
            </Link>
            <Link href="/privacy" prefetch={false} className="hover:text-[#ef7d3b] underline-offset-2 hover:underline">
              {t('legal.privacy')}
            </Link>
            <Link href="/credits" prefetch={false} className="hover:text-[#ef7d3b] underline-offset-2 hover:underline">
              {t('legal.credits')}
            </Link>
          </nav>
        </div>
        <p className="text-[11px] text-[#b89a7a] mt-6 text-center sm:text-left">
          © {year} {messages.app.name}
        </p>
      </div>
    </footer>
  );
}
