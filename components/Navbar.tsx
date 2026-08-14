'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/config/app';
import { Button } from '@/components/ui/button';
import { Plus, LogIn, LogOut, Trophy, Bookmark } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { DataSourceBadge } from '@/components/DataSourceBadge';

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 border-b-[3px] border-[#e8c9a4] bg-[#fff8ee]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0 -rotate-1">
            <div className="text-2xl rotate-6">🧡</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#3b2a22] leading-none hand-title">
                  {APP_NAME}
                </h1>
                <DataSourceBadge />
              </div>
              <p className="text-[11px] text-[#b56a38] leading-none mt-1 hidden sm:block truncate">
                まちの掲示板みたいな、おすすめ
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link href="/ranking">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3 rotate-1">
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline">ランキング</span>
              </Button>
            </Link>

            <Link href="/bookmarks">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3 -rotate-1">
                <Bookmark className="w-4 h-4" />
                <span className="hidden md:inline">保存</span>
              </Button>
            </Link>

            <Link href="/create">
              <Button size="sm" className="gap-1.5 rotate-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">投稿</span>
              </Button>
            </Link>

            {loading ? (
              <div className="w-16 h-8 bg-[#ead6bb] rounded-sm animate-pulse" />
            ) : user && profile ? (
              <>
                <Link
                  href={`/profile/${user.id}`}
                  className="hidden lg:flex items-center gap-2 text-sm font-bold text-[#3b2a22] hover:text-[#c45c28] max-w-[120px] -rotate-1"
                >
                  <span>{profile.avatarUrl}</span>
                  <span className="truncate">{profile.name}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5 -rotate-1">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">ログイン</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
