'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  LogIn,
  Menu,
  Plus,
  Search,
  Shield,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { UserAvatar } from '@/components/user/UserAvatar';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { DataSourceBadge } from '@/components/layout/DataSourceBadge';
import { canAccessAdmin } from '@/lib/auth/admin-access';
import { PUBLIC_BOARD, SHOW_USER_IDENTITY } from '@/lib/auth/public-board';
import { cn } from '@/lib/utils';

function NavPill({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn('nav-pill', active && 'is-active')}
    >
      {icon}
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, profile, loading } = useAuth();
  const { t, messages } = useTranslations();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const renderLinks = (onNavigate?: () => void) => (
    <>
      <NavPill href="/search" icon={<Search className="w-4 h-4" />} onClick={onNavigate}>
        {t('nav.search')}
      </NavPill>
      <NavPill href="/ranking" icon={<Trophy className="w-4 h-4" />} onClick={onNavigate}>
        {t('nav.ranking')}
      </NavPill>
      {PUBLIC_BOARD ? null : (
        <NavPill href="/bookmarks" icon={<Bookmark className="w-4 h-4" />} onClick={onNavigate}>
          {t('nav.bookmarks')}
        </NavPill>
      )}
      {canAccessAdmin(user?.id, profile?.role) ? (
        <NavPill href="/admin/reports" icon={<Shield className="w-4 h-4" />} onClick={onNavigate}>
          {t('nav.admin')}
        </NavPill>
      ) : null}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-page/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 min-h-14 md:min-h-[80px] px-4 md:px-[4vw]">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-2 min-w-0 text-ink no-underline"
          onClick={close}
        >
          <BrandLogo className="brand-logo shrink-0" priority size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[18px] sm:text-[22px] font-bold leading-none truncate">
                {messages.app.name}
              </h1>
              <span className="hidden sm:inline-flex">
                <DataSourceBadge />
              </span>
            </div>
            <p className="text-[11px] text-quiet leading-none mt-1 hidden sm:block truncate">
              {messages.app.navbarSubtitle}
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1.5">{renderLinks()}</div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link href="/create" prefetch={false} className="hidden sm:inline-flex">
            <Button size="sm" className="gap-1.5 h-10 px-4">
              <Plus className="w-4 h-4" />
              {t('nav.create')}
            </Button>
          </Link>

          {loading ? (
            <div className="w-8 h-8 sm:w-16 sm:h-8 bg-soft rounded-[14px] animate-pulse" />
          ) : SHOW_USER_IDENTITY && user && profile ? (
            <Link
              href={`/profile/${user.id}`}
              prefetch={false}
              className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand max-w-[120px] px-2 py-1"
            >
              <UserAvatar
                userId={user.id}
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                className="w-8 h-8"
              />
              <span className="truncate hidden sm:inline">{profile.name}</span>
            </Link>
          ) : PUBLIC_BOARD ? null : (
            <Link href="/login" prefetch={false} className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </Button>
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden touch-manipulation"
            aria-label={open ? t('common.close') : t('nav.menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-page px-4 py-3 flex flex-col gap-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&_.nav-pill]:w-full [&_.nav-pill]:justify-start [&_.nav-pill]:py-3">
          {renderLinks(close)}
          <Link href="/create" prefetch={false} onClick={close} className="nav-pill">
            <Plus className="w-4 h-4" />
            {t('nav.create')}
          </Link>
          {PUBLIC_BOARD || (user && profile) ? null : (
            <Link href="/login" prefetch={false} onClick={close} className="nav-pill">
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </Link>
          )}
        </div>
      ) : null}
    </nav>
  );
}
