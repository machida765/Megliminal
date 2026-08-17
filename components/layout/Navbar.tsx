'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, LogIn, LogOut, Trophy, Bookmark } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { DataSourceBadge } from '@/components/layout/DataSourceBadge';

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const { t, messages } = useTranslations();

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
                  {messages.app.name}
                </h1>
                <DataSourceBadge />
              </div>
              <p className="text-[11px] text-[#b56a38] leading-none mt-1 hidden sm:block truncate">
                {messages.app.navbarSubtitle}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link href="/ranking">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3 rotate-1">
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline">{t('nav.ranking')}</span>
              </Button>
            </Link>

            <Link href="/bookmarks">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3 -rotate-1">
                <Bookmark className="w-4 h-4" />
                <span className="hidden md:inline">{t('nav.bookmarks')}</span>
              </Button>
            </Link>

            <Link href="/create">
              <Button size="sm" className="gap-1.5 rotate-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.create')}</span>
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
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5 -rotate-1">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
