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
import type {
  AuthContextValue,
  OAuthSignInResult,
  PasswordResetRequestResult,
  PasswordUpdateResult,
  SignInResult,
  SignUpResult,
} from '@/lib/auth/types';
import { getSafeRedirectPath } from '@/lib/auth/safe-redirect';
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
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  updatePassword: (password: string) => Promise<PasswordUpdateResult>;
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
      const safeNext = getSafeRedirectPath(redirectTo);
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
    await supabase.auth.signOut({ scope: 'global' });
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<PasswordResetRequestResult> => {
      const t = getAuthTranslator();
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return { error: error.message || t('auth.errors.passwordResetFailed') };
      }
      return {};
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async (password: string): Promise<PasswordUpdateResult> => {
      const t = getAuthTranslator();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { error: error.message || t('auth.errors.passwordUpdateFailed') };
      }
      return {};
    },
    [supabase]
  );

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
      requestPasswordReset,
      updatePassword,
    }),
    [
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
      signInWithPassword,
      signInWithGoogle,
      signUp,
      requestPasswordReset,
      updatePassword,
    ]
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
