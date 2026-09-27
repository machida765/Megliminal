'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { NAV_CURRENT_KEY, NAV_FROM_KEY } from '@/lib/search-view';

/** 直前の画面 URL を残す。投稿詳細の「戻る」が検索状態へ戻るために使う。 */
export function RouteMemory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    try {
      const current = sessionStorage.getItem(NAV_CURRENT_KEY);
      if (current && current !== href) {
        sessionStorage.setItem(NAV_FROM_KEY, current);
      }
      sessionStorage.setItem(NAV_CURRENT_KEY, href);
    } catch {
      // sessionStorage が使えない環境では戻る先を覚えない
    }
  }, [pathname, searchParams]);

  return null;
}
