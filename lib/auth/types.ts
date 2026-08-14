import type { Profile } from '@/types';

export type AuthUser = {
  id: string;
  email?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export type SignInResult = {
  error?: string;
};

export type SignUpResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
};
