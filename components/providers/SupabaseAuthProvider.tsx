'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthContextValue, OAuthSignInResult, SignInResult, SignUpResult } from '@/lib/auth/types';
import { getAuthTranslator } from '@/lib/i18n/auth-messages';
import type { Profile } from '@/types';

type SupabaseAuthContextValue = AuthContextValue & {
  signInWithPassword: (email: string, password: string) => Promise<SignInResult>;
  signInWithGoogle: (redirectTo?: string) => Promise<OAuthSignInResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<SignUpResult>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(
  undefined
);

export { SupabaseAuthContext };

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role, created_at')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile(null);
        return;
      }

      setProfile({
        id: data.id,
        name: data.name,
        avatarUrl: data.avatar_url ?? undefined,
        role: data.role as Profile['role'],
        createdAt: data.created_at,
      });
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [fetchProfile, user]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email });
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser) {
        setUser({ id: nextUser.id, email: nextUser.email });
        await fetchProfile(nextUser.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const t = getAuthTranslator();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return {
          error: t('auth.errors.loginFailed'),
        };
      }
      return {};
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(
    async (redirectTo = '/'): Promise<OAuthSignInResult> => {
      const t = getAuthTranslator();
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const safeNext = redirectTo.startsWith('/') ? redirectTo : '/';
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { error: error.message || t('auth.errors.oauthFailed') };
      }
      return {};
    },
    [supabase]
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
    }): Promise<SignUpResult> => {
      const t = getAuthTranslator();
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { name: input.name } },
      });

      if (error) {
        return { error: error.message || t('auth.errors.signupFailed') };
      }

      if (!data.session) {
        return {
          needsEmailConfirmation: true,
          error: t('auth.errors.emailConfirmation'),
        };
      }

      return {};
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
      signInWithPassword,
      signInWithGoogle,
      signUp,
    }),
    [user, profile, loading, signOut, refreshProfile, signInWithPassword, signInWithGoogle, signUp]
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
