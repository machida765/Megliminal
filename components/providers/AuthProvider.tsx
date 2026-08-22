'use client';

/** 認証の入口。画面は useAuth() を使う。 */
import {
  SupabaseAuthProvider,
  useSupabaseAuth,
} from '@/components/providers/SupabaseAuthProvider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}

export function useAuth() {
  return useSupabaseAuth();
}
