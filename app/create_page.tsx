// app/create/page.tsx

'use client';

import { PostForm } from '@/components/PostForm';
import { MAJOR_CATEGORIES } from '@/data/dummy';

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          新しいおすすめを投稿する
        </h1>
        <p className="text-gray-600">
          あなたの「推し」をみんなに教えてください。
          <br />
          その理由や熱量を思う存分ぶつけてください！
        </p>
      </div>

      {/* 投稿フォーム */}
      <PostForm categories={MAJOR_CATEGORIES} />

      {/* ガイダンス */}
      <div className="mt-8 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 投稿のコツ
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>タイトルは簡潔に、その「もの」の名前を明記</li>
            <li>説明は具体的に、なぜあなたがおすすめするのかを熱く語る</li>
            <li>
              個人の体験や感情が伝わる内容が、最も人に響きます
            </li>
            <li>URLは公式サイトや購入ページへのリンクを推奨</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 投稿例
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <p className="font-semibold text-gray-900">
                タイトル: iPad Pro 12.9inch (2024)
              </p>
              <p className="text-gray-600">
                説明: 完全にノート作業をデジタル化できました。ペンシルの遅延がほぼ0で、紙に書く感覚そのもの。イラストレーターや建築家にも推奨されるほどの精度です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
