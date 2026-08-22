/** クレジットページに掲載する第三者素材（アバター等） */
export type CreditEntry = {
  name: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  note?: string;
};

export const DICEBEAR_CORE = {
  name: 'DiceBear',
  author: 'Florian Körner ほか',
  license: 'MIT License',
  licenseUrl: 'https://github.com/dicebear/dicebear/blob/main/LICENSE',
  sourceUrl: 'https://www.dicebear.com/',
  note: 'デフォルトアバター SVG の生成に使用しています。',
} as const;

/** 本番で使用中の DiceBear スタイル（scripts/generate-avatars.mjs と同期） */
export const AVATAR_STYLES: CreditEntry[] = [
  {
    name: 'Lorelei',
    author: 'Lisa Wischofsky',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://www.dicebear.com/styles/lorelei/',
  },
  {
    name: 'Notionists',
    author: 'Zoish',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://www.dicebear.com/styles/notionists/',
  },
  {
    name: 'Open Peeps',
    author: 'Pablo Stanley',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://www.openpeeps.com/',
  },
  {
    name: 'Pixel Art',
    author: 'DiceBear',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://www.dicebear.com/styles/pixel-art/',
  },
  {
    name: 'Fun Emoji',
    author: 'DiceBear',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://www.dicebear.com/styles/fun-emoji/',
  },
  {
    name: 'Bottts',
    author: 'Pablo Stanley',
    license: 'Free for personal and commercial use',
    licenseUrl: 'https://bottts.com/',
    sourceUrl: 'https://bottts.com/',
  },
  {
    name: 'Avataaars',
    author: 'Pablo Stanley',
    license: 'Free for personal and commercial use',
    licenseUrl: 'https://avataaars.com/',
    sourceUrl: 'https://avataaars.com/',
  },
  {
    name: 'Adventurer',
    author: 'Lisa Wischofsky',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://www.dicebear.com/styles/adventurer/',
    note: 'クレジット表記が必要なライセンスです。',
  },
  {
    name: 'Croodles',
    author: 'vijay verma',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://www.dicebear.com/styles/croodles/',
    note: 'クレジット表記が必要なライセンスです。',
  },
  {
    name: 'Micah',
    author: 'Micah Lanier',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://www.dicebear.com/styles/micah/',
    note: 'クレジット表記が必要なライセンスです。',
  },
];

export const OTHER_CREDITS: CreditEntry[] = [
  {
    name: 'Lucide Icons',
    author: 'Lucide Contributors',
    license: 'ISC License',
    licenseUrl: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
    sourceUrl: 'https://lucide.dev/',
    note: 'UI アイコンに使用しています。',
  },
];
