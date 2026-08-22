/**
 * 同一オリジン内の絶対パスだけを許可する。
 * `//example.com` やバックスラッシュを使った外部リダイレクトは拒否する。
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = '/'
): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback;
  }

  return value;
}
