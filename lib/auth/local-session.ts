const SESSION_KEY = 'meguriminal-local-user-id';

export function getLocalUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setLocalUserId(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearLocalUserId() {
  localStorage.removeItem(SESSION_KEY);
}
