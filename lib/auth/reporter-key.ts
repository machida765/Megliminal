const REPORTER_KEY_STORAGE = 'megliminal.reporterKey';

function randomKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rk-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** 未ログイン通報用の端末 ID（localStorage） */
export function getOrCreateReporterKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(REPORTER_KEY_STORAGE);
    if (existing) return existing;
    const next = randomKey();
    window.localStorage.setItem(REPORTER_KEY_STORAGE, next);
    return next;
  } catch {
    return randomKey();
  }
}
