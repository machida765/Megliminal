import { getMessages } from '@/messages';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const app = getMessages(DEFAULT_LOCALE).app;

/** @deprecated messages/ja.ts の app.name を正本とする */
export const APP_NAME = app.name;

/** @deprecated messages/ja.ts の app.slug を正本とする */
export const APP_SLUG = app.slug;

/** @deprecated messages/ja.ts の app.tagline を正本とする */
export const APP_TAGLINE = app.tagline;

/** @deprecated messages/ja.ts の app.description を正本とする */
export const APP_DESCRIPTION = app.description;
