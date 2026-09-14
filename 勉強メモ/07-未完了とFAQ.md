# 07. 未完了・FAQ・他AIへの質問集

## 1. まだ `[~]` / 未完了のもの

| 項目 | 状態 | やること |
|---|---|---|
| HTTPS 強制 | △ | 本番ホスティングで HTTP→HTTPS リダイレクト確認 |
| ログイン rate limit | △ | Supabase Dashboard → Auth → Rate Limits |
| CSP strict 化 | △ | `unsafe-inline` を nonce ベースに移行（Next.js 難度高） |
| 退会 API CSRF | △ | Origin チェック or CSRF トークン追加 |
| hidden_posts RLS テスト | ❌ | integration test 追加 |
| 退会 API テスト | ❌ | e2e or integration 追加 |
| ステージング環境 | ❌ | 本番前検証用 |
| 監視（Sentry 等） | ❌ | 本番運用 |

---

## 2. migration 適用確認

セキュリティ強化 migration:

```
supabase/migrations/20260822120000_security_constraints.sql
```

**ローカル:**

```bash
npm run supabase:start
npx supabase db push
```

**本番:** Supabase Dashboard → SQL Editor または CI/CD migration。

適用されていないと CHECK / 投稿頻度 trigger が効かない。

---

## 3. FAQ

### Q. セキュリティ「全部」やった感じがしないのはなぜ？

**A.** Supabase に委譲しているから。パスワード・SQL・セッションの大半は Auth/PostgreSQL 側。アプリは **RLS を前提にした薄い層** + **Zod/middleware**。

### Q. RLS だけで十分では？

**A.** 理論上、RLS だけでも安全。ただし:

- UX（早いエラーメッセージ）
- RLS 設定ミス時の第2防壁
- テストしやすい assert 層

として repository チェックも入れている。

### Q. admin はどうやって作る？

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

クライアントからは **絶対に昇格できない**（trigger で role 固定）。

### Q. DevTools で API を直接叩かれたら？

anon key + ユーザーの JWT で Supabase REST を叩ける。だから **RLS が最後の砦**。UI 非表示は無意味。

### Q. なぜ Server Action を使わない？

設計方針として Supabase 直叩き + RLS。Server Action に移行すると CSRF/サーバー検証の設計が変わる。

### Q. パスワードは DB のどこ？

`auth.users.encrypted_password`（Supabase 管理スキーマ）。`profiles` にはない。

---

## 4. ソースコード「読む順」ガイド（1時間コース）

| 時間 | ファイル | 学ぶこと |
|---|---|---|
| 10分 | `lib/auth/safe-redirect.ts` | Open Redirect |
| 15分 | `lib/supabase/middleware.ts` | 認可（ページ単位） |
| 20分 | `lib/validation/data.ts` | Zod 入力検証 |
| 25分 | `lib/data/supabase-repository.ts`（assert 系） | IDOR |
| 30分 | `supabase/migrations/20260819000000_init.sql`（RLS 部分） | 認可（DB） |
| 15分 | `supabase/migrations/20260822120000_security_constraints.sql` | CHECK + trigger |
| 10分 | `next.config.ts` | ヘッダー |
| 10分 | `lib/supabase/env.ts` | Secrets |
| 15分 | `app/api/account/delete/route.ts` | サーバー専用 API |
| 20分 | `tests/integration/rls.test.ts` | テストの見方 |

---

## 5. 他AIへの質問テンプレート

### 全体レビュー

```
Megliminal（Next.js 16 + Supabase）のセキュリティ構成をレビューしてください。
- ブラウザ → Supabase 直叩き
- RLS + repository assert + Zod + DB CHECK/trigger
- カスタム API は退会のみ（service_role）
設計書/セキュリティ対応メモ.md と 勉強メモ/ を前提に、
弱点と優先度付き改善案を出してください。
```

### IDOR

```
lib/data/supabase-repository.ts の assertCanChangePosts と
supabase RLS posts_delete_own / posts_delete_admin の組み合わせで
IDOR は足りていますか？不足ケースがあれば具体的に。
```

### CSP

```
next.config.ts の CSP が Supabase / Google OAuth / DiceBear アバターと
競合しないかレビューしてください。
```

### 退会 API

```
app/api/account/delete/route.ts の CSRF リスクと
SameSite Cookie だけの mitigation で足りるか評価してください。
```

---

## 6. 用語 ↔ ファイル 逆引き

| 知りたいこと | 見るファイル |
|---|---|
| ログイン | `SupabaseAuthProvider.tsx`, `LoginForm.tsx` |
| admin ガード | `middleware.ts`, `admin/page.tsx` |
| 他人の投稿編集防止 | `assertCanChangePosts`, RLS `posts_update_own` |
| XSS URL | `validation/data.ts`, `PostDetail.tsx` |
| Open Redirect | `safe-redirect.ts`, `auth/callback/route.ts` |
| 秘密鍵混入防止 | `lib/supabase/env.ts` |
| 週1投稿 | `enforce_post_frequency` trigger |
| 退会 | `api/account/delete/route.ts` |
| テスト | `tests/integration/rls.test.ts` |

---

## 7. 関連ドキュメント（正本）

| ファイル | 用途 |
|---|---|
| [`設計書/セキュリティ対応メモ.md`](../設計書/セキュリティ対応メモ.md) | タスク3の実装索引・FAQ |
| [`設計書/セキュリティ運用設定.md`](../設計書/セキュリティ運用設定.md) | 本番 Dashboard 設定 |
| [`設計書/タスクリスト.md`](../設計書/タスクリスト.md) | 全体進捗 |
| [`設計書/テーブル定義/テーブル定義書.md`](../設計書/テーブル定義/テーブル定義書.md) | RLS 方針の設計根拠 |

---

## 8. 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-09-01 | 初版 |
