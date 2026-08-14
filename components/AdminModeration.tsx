'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Flag, Trash2 } from 'lucide-react';
import { getRepository } from '@/lib/data';
import { usePosts, useReports } from '@/lib/data/hooks';
import { REPORT_REASON_LABELS } from '@/types';

export function AdminModeration() {
  const { reports, loading, reload } = useReports('pending');
  const { posts } = usePosts();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const postMap = useMemo(
    () => new Map(posts.map((p) => [p.id, p])),
    [posts]
  );

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { postId: string; reports: typeof reports; count: number }
    >();
    for (const report of reports) {
      const existing = map.get(report.postId);
      if (existing) {
        existing.reports.push(report);
        existing.count += 1;
      } else {
        map.set(report.postId, {
          postId: report.postId,
          reports: [report],
          count: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [reports]);

  const toggle = (postId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === grouped.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(grouped.map((g) => g.postId)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `選択した ${selected.size} 件の投稿を削除しますか？この操作は取り消せません。`
      )
    ) {
      return;
    }
    setDeleting(true);
    const ids = [...selected];
    await getRepository().deletePosts(ids);
    await getRepository().resolveReports(ids);
    setSelected(new Set());
    await reload();
    setDeleting(false);
  };

  if (loading) {
    return <p className="text-gray-500 text-sm">読み込み中...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            通報・モデレーション
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            未対応の通報: {reports.length} 件 / 対象投稿: {grouped.length} 件
          </p>
        </div>
        {grouped.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={toggleAll}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {selected.size === grouped.length ? '選択解除' : 'すべて選択'}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selected.size === 0 || deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? '削除中...' : `一括削除 (${selected.size})`}
            </button>
          </div>
        )}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 px-5 py-8 text-center text-sm text-gray-600">
          <Flag className="w-6 h-6 mx-auto mb-2 text-gray-700" />
          未対応の通報はありません
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => {
            const post = postMap.get(group.postId);
            return (
              <div
                key={group.postId}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  selected.has(group.postId)
                    ? 'border-red-500/50 bg-red-950/20'
                    : 'border-gray-800 bg-gray-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(group.postId)}
                  onChange={() => toggle(group.postId)}
                  className="mt-1 accent-red-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded-full">
                      通報 {group.count} 件
                    </span>
                    {post && (
                      <Link
                        href={`/post/${post.id}`}
                        className="text-sm font-semibold text-white hover:underline truncate"
                        target="_blank"
                      >
                        {post.title}
                      </Link>
                    )}
                    {!post && (
                      <span className="text-sm text-gray-500">（投稿 ID: {group.postId}）</span>
                    )}
                  </div>
                  <ul className="text-xs text-gray-500 space-y-0.5">
                    {group.reports.slice(0, 3).map((r) => (
                      <li key={r.id}>
                        {REPORT_REASON_LABELS[r.reason]}
                        {r.detail ? ` — ${r.detail}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
