'use client';

import { useContext } from 'react';
import { getDataSource } from '@/lib/config/data-source';
import { LocalAuthProvider, LocalAuthContext } from '@/components/providers/LocalAuthProvider';
import {
  SupabaseAuthProvider,
  SupabaseAuthContext,
} from '@/components/providers/SupabaseAuthProvider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (getDataSource() === 'supabase') {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useAuth() {
  const local = useContext(LocalAuthContext);
  const supabase = useContext(SupabaseAuthContext);
  const value = local ?? supabase;

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
