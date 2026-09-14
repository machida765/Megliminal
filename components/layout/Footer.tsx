'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useTranslations } from '@/components/providers/LocaleProvider';

export function Footer() {
  const { t, messages } = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto">
      <div className="flex items-center gap-2.5">
        <BrandLogo className="brand-logo brand-logo-sm shrink-0" />
        <p className="text-xs opacity-80">{messages.app.tagline}</p>
      </div>
      <nav
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
        aria-label={t('legal.footerNav')}
      >
        <Link href="/terms" prefetch={false} className="hover:underline underline-offset-2">
          {t('legal.terms')}
        </Link>
        <Link href="/privacy" prefetch={false} className="hover:underline underline-offset-2">
          {t('legal.privacy')}
        </Link>
        <Link href="/credits" prefetch={false} className="hover:underline underline-offset-2">
          {t('legal.credits')}
        </Link>
      </nav>
      <p className="text-[11px] opacity-75 w-full sm:w-auto">
        © {year} {messages.app.name}
      </p>
    </footer>
  );
}
