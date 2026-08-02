// app/admin/page.tsx
'use client';

import { useState } from 'react';
import { MAJOR_CATEGORIES } from '@/data/dummy';
import { MajorCategory } from '@/types';
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

// ─── アイコン選択肢（lucide-react から管理画面向けに厳選） ───
const ICON_OPTIONS = [
  'Youtube', 'BookOpen', 'Film', 'Music', 'Gamepad2',
  'Cpu', 'UtensilsCrossed', 'Lightbulb', 'MapPin',
  'MoreHorizontal', 'Shirt', 'Heart', 'Star', 'Globe',
  'Camera', 'Headphones', 'Dumbbell', 'Leaf', 'Briefcase',
];

// ─── アイコンレンダラー ───
function Icon({ name, className = 'w-4 h-4' }: { name?: string; className?: string }) {
  if (!name) return null;
  const C = (LucideIcons as any)[name];
  return C ? <C className={className} /> : null;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<MajorCategory[]>(
    () => [...MAJOR_CATEGORIES].sort((a, b) => a.order - b.order)
  );

  // 新規追加フォームの状態
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Star');
  const [addError, setAddError] = useState('');

  // 削除確認ダイアログの状態
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ─── 追加 ───
  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError('カテゴリ名を入力してください');
      return;
    }
    if (categories.some((c) => c.name === trimmed)) {
      setAddError('同じ名前のカテゴリがすでに存在します');
      return;
    }
    const newCat: MajorCategory = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      icon: newIcon,
      order: categories.length + 1,
      isActive: true,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    // グローバルなダミーデータにも反映
    MAJOR_CATEGORIES.push(newCat);
    setNewName('');
    setNewIcon('Star');
    setAddError('');
  };

  // ─── 削除 ───
  const handleDelete = (id: string) => {
    const updated = categories
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(updated);
    // グローバルデータにも反映
    const idx = MAJOR_CATEGORIES.findIndex((c) => c.id === id);
    if (idx !== -1) MAJOR_CATEGORIES.splice(idx, 1);
    setDeleteTargetId(null);
  };

  // ─── 並び替え ───
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categories.length - 1) return;

    const next = [...categories];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const reordered = next.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(reordered);
    // グローバルデータにも反映
    reordered.forEach((c) => {
      const g = MAJOR_CATEGORIES.find((g) => g.id === c.id);
      if (g) g.order = c.order;
    });
  };

  // ─── 表示切替 ───
  const handleToggleActive = (id: string) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setCategories(updated);
    const g = MAJOR_CATEGORIES.find((c) => c.id === id);
    if (g) g.isActive = !g.isActive;
  };

  const deleteTarget = categories.find((c) => c.id === deleteTargetId);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ヘッダー */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold tracking-wide">管理者画面</h1>
          <span className="ml-auto text-xs text-gray-500 font-mono">
            /admin
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* ── セクション①：大カテゴリ一覧 ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              大カテゴリ
            </h2>
            <span className="text-xs text-gray-600">
              {categories.filter((c) => c.isActive).length} / {categories.length} 件 表示中
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
                {/* ドラッグハンドル（視覚的）*/}
                <GripVertical className="w-4 h-4 text-gray-700 flex-shrink-0" />

                {/* order番号 */}
                <span className="w-5 text-center text-xs text-gray-600 font-mono flex-shrink-0">
                  {cat.order}
                </span>

                {/* アイコン */}
                <span className="w-7 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <Icon name={cat.icon} className="w-4 h-4" />
                </span>

                {/* 名前 */}
                <span className="flex-1 font-medium text-sm">{cat.name}</span>

                {/* 非表示バッジ */}
                {!cat.isActive && (
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    非表示
                  </span>
                )}

                {/* アクションボタン群 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* 上へ */}
                  <button
                    onClick={() => handleMove(cat.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                    title="上へ"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* 下へ */}
                  <button
                    onClick={() => handleMove(cat.id, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                    title="下へ"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* 表示切替 */}
                  <button
                    onClick={() => handleToggleActive(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    title={cat.isActive ? '非表示にする' : '表示する'}
                  >
                    {cat.isActive
                      ? <Eye className="w-4 h-4" />
                      : <EyeOff className="w-4 h-4" />
                    }
                  </button>

                  {/* 削除 */}
                  <button
                    onClick={() => setDeleteTargetId(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-600 hover:text-red-400 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-10 text-gray-600 text-sm">
                カテゴリがありません。下のフォームから追加してください。
              </div>
            )}
          </div>
        </section>

        {/* ── セクション②：新規追加フォーム ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            大カテゴリを追加
          </h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            {/* カテゴリ名 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                カテゴリ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="例: ポッドキャスト"
                maxLength={20}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
              />
              {addError && (
                <p className="text-xs text-red-400 mt-1">{addError}</p>
              )}
            </div>

            {/* アイコン選択 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                アイコン
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
              <p className="text-xs text-gray-600 mt-1.5">
                選択中: {newIcon}
              </p>
            </div>

            {/* プレビュー */}
            {newName.trim() && (
              <div className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-600 mb-2">プレビュー</p>
                <div className="flex items-center gap-2">
                  <Icon name={newIcon} className="w-4 h-4 text-gray-300" />
                  <span className="text-sm font-medium">{newName.trim()}</span>
                </div>
              </div>
            )}

            {/* 追加ボタン */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              追加する
            </button>
          </div>
        </section>

        {/* ── セクション③：今後の予定（タグ管理への誘導） ── */}
        <section>
          <div className="border border-dashed border-gray-800 rounded-xl px-5 py-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-500 mb-1">📌 次のステップ</p>
            <p>タグ管理（追加・削除・並び替え・表示切替）も同じ構造で実装予定です。</p>
          </div>
        </section>
      </div>

      {/* ── 削除確認ダイアログ ── */}
      {deleteTargetId && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-base mb-2">本当に削除しますか？</h3>
            <p className="text-sm text-gray-400 mb-1">
              大カテゴリ「<span className="text-white font-semibold">{deleteTarget.name}</span>」を削除します。
            </p>
            <p className="text-xs text-gray-600 mb-6">
              ⚠️ このカテゴリに紐づいた投稿は「その他」扱いになります。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
