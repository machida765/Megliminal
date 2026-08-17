'use client';

import { useRouter } from 'next/navigation';
import { isLocalDataSource } from '@/lib/config/data-source';
import { localDataRepository } from '@/lib/data/local-repository';
import { useLocalAuth } from '@/components/providers/LocalAuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';

const QUICK_USERS = [
  { id: 'user-001', labelKey: 'dev.local.userTaro' as const },
  { id: 'user-002', labelKey: 'dev.local.userHanako' as const },
] as const;

/** Local 開発時のみ: クイックログイン・データリセット */
export function LocalDevTools() {
  if (!isLocalDataSource() || process.env.NODE_ENV === 'production') {
    return null;
  }
  return <LocalDevToolsPanel />;
}

function LocalDevToolsPanel() {
  const router = useRouter();
  const { t } = useTranslations();
  const auth = useLocalAuth();

  const handleReset = async () => {
    if (!confirm(t('dev.local.resetConfirm'))) return;
    await localDataRepository.resetToSeed();
    router.refresh();
    window.location.href = '/';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs paper-note bg-[#fff7d6] p-3 shadow-lg rotate-1 border border-[#e8c9a4]">
      <p className="text-[11px] font-black text-[#c45c28] mb-2">
        {t('dev.local.title')}
      </p>
      <p className="text-[10px] text-[#8a6a52] mb-2 leading-relaxed">
        {t('dev.local.hint')}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {QUICK_USERS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => auth.signInAsUser(item.id)}
          >
            {t(item.labelKey)}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="flat-outline"
        size="sm"
        className="text-xs h-7 w-full"
        onClick={handleReset}
      >
        {t('dev.local.reset')}
      </Button>
    </div>
  );
}
