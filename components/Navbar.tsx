// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, LogIn } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-orange-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6">
              🧡
            </div>
            <div>
              <h1 className="text-xl font-black text-orange-950 tracking-tight leading-none">
                okini
              </h1>
              <p className="text-xs text-orange-700/70 leading-none mt-1">
                アルゴリズムフリーな人のおすすめ
              </p>
            </div>
          </Link>

          {/* アクションボタン */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">投稿する</span>
                <span className="sm:hidden">投稿</span>
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">ログイン</span>
                <span className="sm:hidden">ログイン</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
