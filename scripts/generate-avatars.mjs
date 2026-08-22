/**
 * public/avatars/ に 100 種のデフォルトアバター SVG を生成する。
 *
 * 使用: DiceBear (https://www.dicebear.com) — MIT / 各スタイルは CC0 等
 * ライセンス: https://www.dicebear.com/licenses/
 *
 * 実行: npm run avatars:generate
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Avatar, Style } from '@dicebear/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'avatars');
const COUNT = 100;
const SIZE = 128;

/** 見た目のバラつき用（CC0 中心 + DiceBear 定番スタイル） */
const STYLE_NAMES = [
  'lorelei',
  'notionists',
  'open-peeps',
  'pixel-art',
  'fun-emoji',
  'bottts',
  'avataaars',
  'adventurer',
  'croodles',
  'micah',
];

fs.mkdirSync(outDir, { recursive: true });

/** @type {Map<string, Style>} */
const styleCache = new Map();

async function getStyle(name) {
  if (styleCache.has(name)) return styleCache.get(name);
  const mod = await import(`@dicebear/styles/${name}.json`, {
    with: { type: 'json' },
  });
  const style = new Style(mod.default);
  styleCache.set(name, style);
  return style;
}

for (let i = 0; i < COUNT; i++) {
  const styleName = STYLE_NAMES[i % STYLE_NAMES.length];
  const style = await getStyle(styleName);
  const seed = `megliminal-default-${String(i).padStart(3, '0')}`;
  const avatar = new Avatar(style, { seed, size: SIZE });
  fs.writeFileSync(
    path.join(outDir, `${String(i).padStart(3, '0')}.svg`),
    avatar.toString(),
    'utf8'
  );
}

console.log(
  `Generated ${COUNT} DiceBear avatars (${STYLE_NAMES.length} styles) in ${outDir}`
);
