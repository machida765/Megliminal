'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const QueryDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : dynamic(
        () =>
          import('@tanstack/react-query-devtools').then(
            (mod) => mod.ReactQueryDevtools
          ),
        { ssr: false }
      );

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5分間フレッシュとみなす
            gcTime: 1000 * 60 * 30, // 30分間未着用のキャッシュを保持
            refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を抑える
            retry: 1, // 失敗時のリトライは1回
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' ? (
        <QueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
}
