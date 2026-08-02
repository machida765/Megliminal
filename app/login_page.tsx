// app/login/page.tsx

'use client';

import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* ページヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ログイン
        </h1>
        <p className="text-gray-600">
          アカウントにログインして、おすすめを投稿しましょう
        </p>
      </div>

      {/* ログインフォーム */}
      <LoginForm />

      {/* 情報パネル */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">
          🚀 今後のアップデート
        </h3>
        <ul className="text-sm text-purple-800 space-y-2">
          <li>✅ Phase 2: Supabase による認証機能</li>
          <li>✅ Phase 2: ユーザープロフィール</li>
          <li>✅ Phase 2: 投稿の永続化</li>
          <li>✅ Phase 3: iOS/Android アプリ</li>
        </ul>
      </div>
    </div>
  );
}
