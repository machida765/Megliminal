'use client';

/** 管理 `/admin`。カテゴリ操作はこのファイル。通報タブは AdminModeration。 */
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CategoryLookFields } from '@/components/admin/CategoryLookFields';
import { getRepository } from '@/lib/data';
import { useInvalidate } from '@/lib/data/hooks';
import { MajorCategory, type CategoryPalette } from '@/types';
import { AdminModeration } from '@/components/moderation/AdminModeration';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { canAccessAdmin } from '@/lib/auth/admin-access';
import {
  DEFAULT_CATEGORY_PALETTE,
  resolveCategoryIcon,
  resolveCategoryPalette,
} from '@/lib/category-visual';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Paintbrush,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

function Icon({ name, className = 'w-4 h-4' }: { name?: string; className?: string }) {
  const C = resolveCategoryIcon(name);
  return C ? <C className={className} /> : null;
}

export default function AdminPage() {
  const { t } = useTranslations();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<'categories' | 'moderation'>('moderation');
  const {
    data: categories = [],
    isLoading: loading,
    refetch,
  } = useQuery<MajorCategory[]>({
    queryKey: ['majorCategories', 'admin'],
    queryFn: () => getRepository().getMajorCategories(),
  });
  const invalidate = useInvalidate();
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Star');
  const [newPalette, setNewPalette] = useState<CategoryPalette>(DEFAULT_CATEGORY_PALETTE);
  const [addError, setAddError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [lookTargetId, setLookTargetId] = useState<string | null>(null);
  const [lookDraft, setLookDraft] = useState<{ icon: string; palette: CategoryPalette } | null>(null);
  const [savingLook, setSavingLook] = useState(false);

  const toMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

  const reload = async () => {
    invalidate('majorCategories');
    await refetch();
  };

  const openLook = (category: MajorCategory) => {
    if (lookTargetId === category.id) {
      setLookTargetId(null);
      setLookDraft(null);
      return;
    }
    setLookTargetId(category.id);
    setLookDraft({
      icon: category.icon ?? 'MoreHorizontal',
      palette: resolveCategoryPalette(category.id, category.palette) ?? DEFAULT_CATEGORY_PALETTE,
    });
  };

  const saveLook = async (category: MajorCategory) => {
    if (!lookDraft) return;
    setSavingLook(true);
    try {
      await getRepository().upsertMajorCategory({
        ...category,
        icon: lookDraft.icon,
        palette: lookDraft.palette,
      });
      await reload();
      setLookTargetId(null);
      setLookDraft(null);
      setActionError('');
    } catch (error) {
      setActionError(toMessage(error, t('admin.categories.saveFailed')));
    } finally {
      setSavingLook(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError(t('admin.categories.nameRequired'));
      return;
    }
    if (categories.some((c) => c.name === trimmed)) {
      setAddError(t('admin.categories.nameDuplicate'));
      return;
    }

    const newCat: MajorCategory = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      icon: newIcon,
      palette: newPalette,
      order: categories.length + 1,
      isActive: true,
    };

    try {
      await getRepository().upsertMajorCategory(newCat);
      await reload();
      setNewName('');
      setNewIcon('Star');
      setNewPalette(DEFAULT_CATEGORY_PALETTE);
      setAddError('');
      setActionError('');
    } catch (error) {
      setAddError(toMessage(error, t('admin.categories.saveFailed')));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await getRepository().deleteMajorCategory(id);
      await reload();
      setDeleteTargetId(null);
      setActionError('');
    } catch (error) {
      setDeleteTargetId(null);
      setActionError(toMessage(error, t('admin.categories.deleteFailed')));
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categories.length - 1) return;

    const next = [...categories];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const ids = next.map((c) => c.id);

    try {
      await getRepository().reorderMajorCategories(ids);
      await reload();
      setActionError('');
    } catch (error) {
      setActionError(toMessage(error, t('admin.categories.reorderFailed')));
    }
  };

  const handleToggleActive = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;

    try {
      await getRepository().upsertMajorCategory({
        ...target,
        isActive: !target.isActive,
      });
      await reload();
      setActionError('');
    } catch (error) {
      setActionError(toMessage(error, t('admin.categories.saveFailed')));
    }
  };

  const deleteTarget = categories.find((c) => c.id === deleteTargetId);
  const activeCount = categories.filter((c) => c.isActive).length;

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

  if (loading && tab === 'categories') {
    return (
      <div className="min-h-[50vh] bg-page text-quiet flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="bg-page text-ink">
      <div className="border-b border-line bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold tracking-wide">{t('admin.title')}</h1>
          <span className="ml-auto text-xs text-quiet font-mono">/admin</span>
          <button
            onClick={signOut}
            className="ml-2 p-2 rounded-lg hover:bg-soft text-quiet hover:text-ink transition-colors"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="flex gap-2 border-b border-line pb-4">
          <button
            onClick={() => setTab('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'categories'
                ? 'bg-brand text-brand-ink'
                : 'text-quiet hover:text-ink hover:bg-soft'
            }`}
          >
            {t('admin.tabs.categories')}
          </button>
          <button
            onClick={() => setTab('moderation')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'moderation'
                ? 'bg-brand text-brand-ink'
                : 'text-quiet hover:text-ink hover:bg-soft'
            }`}
          >
            {t('admin.tabs.moderation')}
          </button>
          <Link
            href="/admin/inquiries"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-quiet hover:text-ink hover:bg-soft"
          >
            {t('admin.inquiries.tab')}
          </Link>
        </div>

        {tab === 'moderation' && <AdminModeration />}

        {tab === 'categories' && (
        <>
        {actionError && (
          <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {actionError}
          </p>
        )}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-quiet uppercase tracking-widest">
              {t('admin.categories.title')}
            </h2>
            <span className="text-xs text-quiet">
              {t('admin.categories.visibleCount', {
                active: activeCount,
                total: categories.length,
              })}
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => {
              const swatch = resolveCategoryPalette(cat.id, cat.palette) ?? DEFAULT_CATEGORY_PALETTE;
              return (
              <div
                key={cat.id}
                className={`
                  rounded-xl border transition-all
                  ${cat.isActive
                    ? 'bg-surface border-line'
                    : 'bg-page border-line/50 opacity-50'}
                `}
              >
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="w-4 h-4 text-quiet flex-shrink-0" />
                <span className="w-5 text-center text-xs text-quiet font-mono flex-shrink-0">
                  {cat.order}
                </span>
                <span
                  className="h-7 w-7 flex-shrink-0 rounded-md border border-line"
                  style={{ background: swatch.from }}
                  title={t('admin.categories.colorFrom')}
                />
                <span className="w-7 flex items-center justify-center text-ink flex-shrink-0">
                  <Icon name={cat.icon} className="w-4 h-4" />
                </span>
                <span className="flex-1 font-medium text-sm">{cat.name}</span>
                {!cat.isActive && (
                  <span className="text-xs text-quiet bg-soft px-2 py-0.5 rounded-full">
                    {t('admin.categories.hidden')}
                  </span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(cat.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-soft disabled:opacity-20 disabled:cursor-not-allowed text-quiet hover:text-ink transition-colors"
                    title={t('admin.categories.moveUp')}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(cat.id, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 rounded-lg hover:bg-soft disabled:opacity-20 disabled:cursor-not-allowed text-quiet hover:text-ink transition-colors"
                    title={t('admin.categories.moveDown')}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openLook(cat)}
                    className="p-1.5 rounded-lg hover:bg-soft text-quiet hover:text-ink transition-colors"
                    title={t('admin.categories.editLook')}
                    aria-expanded={lookTargetId === cat.id}
                  >
                    <Paintbrush className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-soft text-quiet hover:text-ink transition-colors"
                    title={cat.isActive ? t('admin.categories.hide') : t('admin.categories.show')}
                  >
                    {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/50 text-quiet hover:text-red-600 transition-colors"
                    title={t('admin.categories.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {lookTargetId === cat.id && lookDraft ? (
                <div className="space-y-4 border-t border-line px-4 py-4">
                  <CategoryLookFields
                    icon={lookDraft.icon}
                    palette={lookDraft.palette}
                    onIconChange={(icon) => setLookDraft((current) => current && { ...current, icon })}
                    onPaletteChange={(palette) =>
                      setLookDraft((current) => current && { ...current, palette })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => saveLook(cat)}
                    disabled={savingLook}
                    className="rounded-[14px] bg-brand px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand/90 disabled:opacity-50"
                  >
                    {savingLook ? t('admin.categories.savingLook') : t('admin.categories.saveLook')}
                  </button>
                </div>
              ) : null}
              </div>
            );
            })}

            {categories.length === 0 && (
              <div className="text-center py-10 text-quiet text-sm">
                {t('admin.categories.empty')}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-quiet uppercase tracking-widest mb-4">
            {t('admin.categories.addTitle')}
          </h2>

          <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs text-quiet mb-1.5">
                {t('admin.categories.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={t('admin.categories.namePlaceholder')}
                maxLength={20}
                className="w-full bg-page border border-line rounded-[14px] px-3 py-2 text-sm text-ink placeholder-quiet focus:outline-none focus:border-brand transition-colors"
              />
              {addError && <p className="text-xs text-red-400 mt-1">{addError}</p>}
            </div>

            <CategoryLookFields
              icon={newIcon}
              palette={newPalette}
              onIconChange={setNewIcon}
              onPaletteChange={setNewPalette}
            />

            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-ink rounded-[14px] text-sm font-semibold hover:bg-brand/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('admin.categories.add')}
            </button>
          </div>
        </section>
        </>
        )}
      </div>

      {deleteTargetId && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-[14px] p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-base mb-2">{t('admin.categories.deleteTitle')}</h3>
            <p className="text-sm text-quiet mb-6">
              {t('admin.categories.deleteBody', { name: deleteTarget.name })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 px-4 py-2 bg-soft hover:bg-soft/80 rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors"
              >
                {t('admin.categories.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
