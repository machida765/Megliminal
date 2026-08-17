# UI 文言（i18n）

画面に出す固定文言は **`messages/ja.ts` を正本** として管理します。同じ文言を複数箇所で使う場合も、ここに1つだけ定義してください。

## 構成

| パス | 用途 |
|---|---|
| `messages/ja.ts` | 日本語（デフォルト） |
| `messages/en.ts` | 英語（`ja.ts` と同じキー構造） |
| `lib/i18n/translate.ts` | `t('search.title')` の解決 |
| `lib/i18n/labels.ts` | サーバー側・定数互換用ラベル取得 |
| `components/providers/LocaleProvider.tsx` | クライアント向け `useTranslations()` |

## 使い方

### クライアントコンポーネント

```tsx
'use client';

import { useTranslations } from '@/components/providers/LocaleProvider';

export function Example() {
  const { t, messages } = useTranslations();

  return (
    <>
      <h1>{t('search.title')}</h1>
      <p>{t('search.resultCount', { count: 12 })}</p>
      <span>{messages.nav.ranking}</span>
    </>
  );
}
```

### サーバー / 定数互換

```ts
import { getMessages } from '@/messages';
import { getRankingPeriodLabels } from '@/lib/i18n/labels';

const labels = getRankingPeriodLabels(); // デフォルト ja
const appName = getMessages('ja').app.name;
```

### 変数埋め込み

文言内に `{count}` のように書くと、`t('key', { count: 5 })` で置換されます。

## 言語を増やすとき

1. `messages/en.ts` と同じキー構造でファイルを追加
2. `messages/index.ts` の `catalogs` に登録
3. `lib/i18n/config.ts` の `LOCALE_HTML_LANG` を更新
4. 将来、Cookie や URL で `LocaleProvider` の `locale` を切り替え

## 移行方針

- 新規・修正時はハードコードせず `messages/` に追加
- 既存の `RANKING_PERIOD_LABELS` などは後方互換のため残していますが、非推奨です
