import type { Messages } from '@/messages';

type ParamValue = string | number;

/** ネストしたキー（例: search.title）で文言を取得 */
export function translate(
  messages: Messages,
  key: string,
  params?: Record<string, ParamValue>
): string {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);

  if (typeof value !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing message key: ${key}`);
    }
    return key;
  }

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [name, paramValue]) =>
      text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(paramValue)),
    value
  );
}

export type TranslateFn = (
  key: string,
  params?: Record<string, ParamValue>
) => string;

export function createTranslator(messages: Messages): TranslateFn {
  return (key, params) => translate(messages, key, params);
}
