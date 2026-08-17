import { en } from './en';
import { ja, type Messages } from './ja';

export type { Messages } from './ja';
export { ja, en };

const catalogs = { ja, en } as const;

export type Locale = keyof typeof catalogs;

export const LOCALES = Object.keys(catalogs) as Locale[];

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? ja;
}
