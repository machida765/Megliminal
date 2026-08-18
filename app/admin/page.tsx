'use client';

import { useEffect, useState } from 'react';
import { getRepository } from '@/lib/data';
import { MajorCategory } from '@/types';
import { AdminModeration } from '@/components/moderation/AdminModeration';
import { useTranslations } from '@/components/providers/LocaleProvider';
import * as LucideIcons from 'lucide-react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  ShieldAlert,
} from 'lucide-react';

const ICON_OPTIONS = [
  'Youtube', 'BookOpen', 'Film', 'Music', 'Gamepad2',
  'Cpu', 'UtensilsCrossed', 'Lightbulb', 'MapPin',
  'MoreHorizontal', 'Shirt', 'Heart', 'Star', 'Globe',
  'Camera', 'Headphones', 'Dumbbell', 'Leaf', 'Briefcase',
];

function Icon({ name, className = 'w-4 h-4' }: { name?: string; className?: string }) {
  if (!name) return null;
  const C = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name];
  return C ? <C className={className} /> : null;
}

export default function AdminPage() {
  const { t } = useTranslations();
  const [tab, setTab] = useState<'categories' | 'moderation'>('categories');
  const [categories, setCategories] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Star');
  const [addError, setAddError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const reload = async () => {
    const data = await getRepository().getMajorCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

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
      order: categories.length + 1,
      isActive: true,
    };

    await getRepository().upsertMajorCategory(newCat);
    await reload();
    setNewName('');
    setNewIcon('Star');
    setAddError('');
  };

  const handleDelete = async (id: string) => {
    await getRepository().deleteMajorCategory(id);
    await reload();
    setDeleteTargetId(null);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categories.length - 1) return;

    const next = [...categories];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const ids = next.map((c) => c.id);
    const reordered = await getRepository().reorderMajorCategories(ids);
    setCategories(reordered);
  };

  const handleToggleActive = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    await getRepository().upsertMajorCategory({
      ...target,
      isActive: !target.isActive,
    });
    await reload();
  };

  const deleteTarget = categories.find((c) => c.id === deleteTargetId);
  const activeCount = categories.filter((c) => c.isActive).length;

  if (loading && tab === 'categories') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold tracking-wide">{t('admin.title')}</h1>
          <span className="ml-auto text-xs text-gray-500 font-mono">/admin</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="flex gap-2 border-b border-gray-800 pb-4">
          <button
            onClick={() => setTab('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'categories'
                ? 'bg-white text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t('admin.tabs.categories')}
          </button>
          <button
            onClick={() => setTab('moderation')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'moderation'
                ? 'bg-white text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t('admin.tabs.moderation')}
          </button>
        </div>

        {tab === 'moderation' && <AdminModeration />}

        {tab === 'categories' && (
        <>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              {t('admin.categories.title')}
            </h2>
            <span className="text-xs text-gray-600">
              {t('admin.categories.visibleCount', {
                active: activeCount,
                total: categories.length,
              })}
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${cat.isActive
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-gray-950 border-gray-800/50 opacity-50'}
                `}
              >
                <GripVertical className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <span className="w-5 text-center text-xs text-gray-600 font-mono flex-shrink-0">
                  {cat.order}
                </span>
                <span className="w-7 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <Icon name={cat.icon} className="w-4 h-4" />
                </span>
                <span className="flex-1 font-medium text-sm">{cat.name}</span>
                {!cat.isActive && (
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {t('admin.categories.hidden')}
                  </span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(cat.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                    title={t('admin.categories.moveUp')}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(cat.id, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                    title={t('admin.categories.moveDown')}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    title={cat.isActive ? t('admin.categories.hide') : t('admin.categories.show')}
                  >
                    {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-600 hover:text-red-400 transition-colors"
                    title={t('admin.categories.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-10 text-gray-600 text-sm">
                {t('admin.categories.empty')}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            {t('admin.categories.addTitle')}
          </h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                {t('admin.categories.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={t('admin.categories.namePlaceholder')}
                maxLength={20}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
              />
              {addError && <p className="text-xs text-red-400 mt-1">{addError}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                {t('admin.categories.iconLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setNewIcon(iconName)}
                    className={`
                      p-2 rounded-lg border transition-all
                      ${newIcon === iconName
                        ? 'bg-white text-gray-900 border-white'
                        : 'bg-gray-950 text-gray-400 border-gray-700 hover:border-gray-500'}
                    `}
                    title={iconName}
                  >
                    <Icon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
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
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-base mb-2">{t('admin.categories.deleteTitle')}</h3>
            <p className="text-sm text-gray-400 mb-6">
              {t('admin.categories.deleteBody', { name: deleteTarget.name })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
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
