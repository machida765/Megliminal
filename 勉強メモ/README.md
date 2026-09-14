# メグリミナル セキュリティ 勉強メモ

> **対象:** セキュリティを「なんとなく」から「コードが読める」レベルに引き上げたい中級者  
> **前提:** Next.js / React / TypeScript の基本は触ったことがある  
> **正本ドキュメント:** [`設計書/セキュリティ対応メモ.md`](../設計書/セキュリティ対応メモ.md) / [`設計書/セキュリティ運用設定.md`](../設計書/セキュリティ運用設定.md)

---

## このフォルダの目的

タスクリスト「3. セキュリティ」で **実際にコードに落とした内容** を、教科書っぽく読める形に再構成したもの。

- 「何を脅威とみなしたか」
- 「どのファイルの何行が効いているか」
- 「なぜその層が必要か（Defense in Depth）」
- 「テストでどう確認しているか」
- 「まだ `[~]` / 未完了のもの」

---

## 読む順番（おすすめ）

| 順 | ファイル | 内容 |
|---|---|---|
| 1 | [00-全体像と用語.md](./00-全体像と用語.md) | アーキテクチャ・用語・多層防御の考え方 |
| 2 | [01-認証とセッション.md](./01-認証とセッション.md) | ログイン/OAuth/パスワード/セッション Cookie |
| 3 | [02-認可とRLS.md](./02-認可とRLS.md) | middleware / admin / RLS / トリガー |
| 4 | [03-XSS-CSRF-ヘッダー.md](./03-XSS-CSRF-ヘッダー.md) | CSP, URL 検証, Open Redirect |
| 5 | [04-入力検証とIDOR.md](./04-入力検証とIDOR.md) | Zod, repository チェック, 投稿頻度 |
| 6 | [05-Secrets-退会-運用.md](./05-Secrets-退会-運用.md) | env 検証, service_role, 退会 API |
| 7 | [06-テストで学ぶ.md](./06-テストで学ぶ.md) | Vitest / Playwright / RLS 結合テスト |
| 8 | [07-未完了とFAQ.md](./07-未完了とFAQ.md) | まだやること・よくある疑問 |
| 9 | [08-実践ウォークスルー.md](./08-実践ウォークスルー.md) | 投稿作成・削除・退会をコード追跡 |

---

## タスクリスト 2（認証・認可）も含む

セキュリティは **タスク3だけではない**。タスク2で入れた内容もこのメモ群に反映している。

| 項目 | 主な実装 |
|---|---|
| ログイン必須ページ | `lib/supabase/middleware.ts` |
| admin ガード | middleware + `app/admin/page.tsx` |
| パスワードリセット | `/forgot-password`, `/reset-password` |
| 自分の投稿削除 UI | `components/post/PostDetail.tsx` |
| Open Redirect 防止 | `lib/auth/safe-redirect.ts` |

詳細は `01-認証とセッション.md` / `02-認可とRLS.md` を参照。

---

## このプロジェクトのセキュリティの「型」

```
ブラウザ (React)
    ↓ Zod で入力検証
    ↓ repository で「本人か/admin か」チェック
    ↓ Supabase JS クライアント（Bearer トークン付き）
    ↓ Supabase Auth（JWT / Cookie）
    ↓ PostgreSQL RLS（行ごとの権限）
    ↓ CHECK 制約 + Trigger（DB 最終防衛）
```

**重要:** 自前の CRUD API Route はほぼ作っていない。だから **RLS が最後の砦** になる設計。

例外: 退会だけ `POST /api/account/delete`（service_role が必要なため）。

---

## クイック参照：主要ファイル

| ファイル | 役割 |
|---|---|
| `lib/supabase/middleware.ts` | ログイン必須ページ + admin ガード |
| `lib/validation/data.ts` | Zod スキーマ + 安全 URL |
| `lib/data/supabase-repository.ts` | 書き込み前の assert 系 |
| `lib/supabase/env.ts` | anon key / service_role 混入防止 |
| `lib/auth/safe-redirect.ts` | Open Redirect 防止 |
| `next.config.ts` | CSP / HSTS 等 |
| `supabase/migrations/20260819000000_init.sql` | RLS 本体 |
| `supabase/migrations/20260822120000_security_constraints.sql` | CHECK + 投稿頻度 trigger |
| `app/api/account/delete/route.ts` | 退会（サーバー専用） |
| `tests/integration/rls.test.ts` | RLS 結合テスト |

---

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-09-01 | 初版（セクション3対応完了時点の学習用まとめ） |
