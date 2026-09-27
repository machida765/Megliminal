'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { AdminInquiries } from '@/components/contact/AdminInquiries';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { canAccessAdmin } from '@/lib/auth/admin-access';

export default function AdminInquiriesPage() {
  const { t } = useTranslations();
  const { user, profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[50vh] bg-page text-quiet flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!user || !canAccessAdmin(user.id, profile?.role)) {
    return (
      <div className="min-h-[50vh] bg-page text-quiet flex items-center justify-center px-4">
        <p className="text-center">{t('auth.errors.forbidden')}</p>
      </div>
    );
  }

  return (
    <div className="bg-page text-ink min-h-[50vh]">
      <div className="border-b border-line bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <Mail className="w-5 h-5 text-brand" />
          <h1 className="text-lg font-bold tracking-wide">{t('admin.inquiries.title')}</h1>
          <Link
            href="/admin"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('admin.inquiries.backToAdmin')}
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <AdminInquiries />
      </div>
    </div>
  );
}
