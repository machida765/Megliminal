import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 結合テストはローカル Supabase の鍵を使うため .env.local を読み込む。
 * CI では環境変数が直接渡されるので、ファイルが無くても何もしない。
 */
for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (process.env[key] !== undefined) continue;

    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
    process.env[key] = value;
  }
}
