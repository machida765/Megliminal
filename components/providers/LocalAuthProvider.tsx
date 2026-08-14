'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getRepository } from '@/lib/data';
import { localDataRepository } from '@/lib/data/local-repository';
import {
  clearLocalUserId,
  getLocalUserId,
  setLocalUserId,
} from '@/lib/auth/local-session';
import type { AuthContextValue, SignInResult, SignUpResult } from '@/lib/auth/types';
import type { Profile } from '@/types';

type LocalAuthContextValue = AuthContextValue & {
  signInWithPassword: (email: string, password: string) => Promise<SignInResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<SignUpResult>;
};

const LocalAuthContext = createContext<LocalAuthContextValue | undefined>(
  undefined
);

export { LocalAuthContext };

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (id: string) => {
    const data = await getRepository().getProfile(id);
    setProfile(data);
    if (data) {
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    const id = getLocalUserId();
    if (!id) {
      setLoading(false);
      return;
    }
    loadProfile(id).finally(() => setLoading(false));
  }, [loadProfile]);

  const signInWithPassword = useCallback(
    async (email: string, _password: string): Promise<SignInResult> => {
      const found = await localDataRepository.findUserByEmail(email);
      if (!found) {
        return { error: 'ユーザーが見つかりません。先に新規登録してください。' };
      }
      setLocalUserId(found.id);
      await loadProfile(found.id);
      return {};
    },
    [loadProfile]
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
    }): Promise<SignUpResult> => {
      const existing = await localDataRepository.findUserByEmail(input.email);
      if (existing) {
        return { error: 'このメールアドレスはすでに登録されています' };
      }

      const user = await localDataRepository.registerUser({
        name: input.name,
        email: input.email,
      });

      setLocalUserId(user.id);
      await loadProfile(user.id);
      return {};
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    clearLocalUserId();
    setUserId(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    await loadProfile(userId);
  }, [loadProfile, userId]);

  const user = userId ? { id: userId, email: profile?.email } : null;

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
      signInWithPassword,
      signUp,
    }),
    [user, profile, loading, signOut, refreshProfile, signInWithPassword, signUp]
  );

  return (
    <LocalAuthContext.Provider value={value}>{children}</LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuth must be used within LocalAuthProvider');
  }
  return context;
}
