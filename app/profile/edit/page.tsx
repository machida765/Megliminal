'use client';

/** プロフィール編集 `/profile/edit`。フォームはこのファイル。保存は updateUser。 */
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { DeleteAccountSection } from '@/components/settings/DeleteAccountSection';
import { getRepository } from '@/lib/data';

export default function ProfileEditPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);

  // プロフィールが読み込まれた（切り替わった）ときだけフォームを初期化する
  if (profile && profile.id !== loadedProfileId) {
    setLoadedProfileId(profile.id);
    setName(profile.name);
    setAvatarUrl(profile.avatarUrl ?? '');
  }

  if (!user || !profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-quiet">
        {t('profile.edit.loginRequired')}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    try {
      await getRepository().updateUser(user.id, {
        name,
        avatarUrl: avatarUrl || undefined,
      });
      await refreshProfile();
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          href={`/profile/${user.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-quiet hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('profile.backToProfile')}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t('profile.edit.title')}</h1>
        <p className="mt-1 text-sm text-quiet">{t('profile.edit.subtitle')}</p>
      </div>

      <section className="rounded-[14px] border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="text-base font-bold text-ink">{t('profile.edit.basicInfo')}</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="flex items-center gap-4">
            <UserAvatar
              userId={user.id}
              name={name}
              avatarUrl={avatarUrl}
              className="h-16 w-16"
            />
            <div className="min-w-0 text-sm text-quiet">
              <p className="truncate font-semibold text-ink">{name || profile.name}</p>
              {user.email ? <p className="truncate">{user.email}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-ink">
              {t('profile.edit.displayName')}
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-ink">
              {t('profile.edit.avatarUrl')}
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={t('profile.edit.avatarPlaceholder')}
            />
            <p className="text-xs leading-relaxed text-quiet">
              {t('profile.edit.avatarHint')}
            </p>
          </div>

          {status === 'saved' ? (
            <p className="text-sm text-[#2f6b3a]">{t('profile.edit.updated')}</p>
          ) : null}
          {status === 'error' ? (
            <p className="text-sm text-[#b42318]">{t('profile.edit.updateFailed')}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
            <Button type="button" variant="ghost" onClick={() => router.push(`/profile/${user.id}`)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('profile.edit.saving') : t('profile.edit.save')}
            </Button>
          </div>
        </form>
      </section>

      <DeleteAccountSection />
    </div>
  );
}
