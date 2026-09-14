# 05. Secrets・退会 API・運用設定

## 1. Secrets 管理 — lib/supabase/env.ts

### 1.1 公開 env の検証

```typescript
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) throw new Error('...');

  // HTTPS 強制（localhost の http は例外）
  if (parsedUrl.protocol !== 'https:' && !isLocal) throw new Error('...');

  if (isServiceRoleKey(anonKey)) {
    throw new Error('service_role / secret keyを公開環境変数に設定できません。');
  }

  return { url: parsedUrl.origin, anonKey };
}
```

### 1.2 service_role 検出ロジック

```typescript
function isServiceRoleKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;

  const decoded = JSON.parse(atob(payload));
  return decoded.role === 'service_role';
}
```

Supabase の JWT 形式キーは payload に `"role":"service_role"` が入る。

**なぜ decode する？** 見た目が anon でも中身が service_role の事故を防ぐ。

### 1.3 使用箇所の統一

| ファイル | 経路 |
|---|---|
| `lib/supabase/client.ts` | `getSupabasePublicEnv()` |
| `lib/supabase/server.ts` | 同上 |
| `lib/supabase/middleware.ts` | 同上 |

**直接 `process.env.NEXT_PUBLIC_*` を読む箇所を減らす** → 検証漏れ防止。

---

## 2. service_role — サーバー専用

**ファイル:** `lib/supabase/service-env.ts` + `lib/supabase/admin.ts`

```typescript
export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

**使う場面:**

- 退会 API（`auth.admin.deleteUser`）
- E2E テストのユーザー作成・削除

**絶対に `'use client'` コンポーネントから import しない。**

---

## 3. 退会 API — 唯一のカスタム状態変更 API

**ファイル:** `app/api/account/delete/route.ts`

### 3.1 フロー

```
1. createClient() でセッション確認
2. body を Zod で parse
3. メールユーザー → パスワード再入力で signInWithPassword（本人確認）
4. OAuth のみ → 確認フレーズ「退会する」
5. createAdminClient().auth.admin.deleteUser(user.id)
6. signOut({ scope: 'global' })
7. { success: true }
```

### 3.2 なぜ service_role が必要？

Supabase Auth のユーザー削除は **Admin API** のみ。anon key + RLS では `auth.users` を消せない。

### 3.3 データ削除

`profiles.id` → `auth.users(id) ON DELETE CASCADE`

投稿・いいね・コメント等も FK CASCADE で物理削除（設計書 `退会処理設計.md` 参照）。

### 3.4 セキュリティ上の論点

| 項目 | 現状 |
|---|---|
| 本人確認 | パスワード or 確認フレーズ ✅ |
| CSRF トークン | なし △ |
| Origin チェック | なし △ |
| rate limit | なし △ |

SameSite Cookie + 同一オリジン fetch で実用上は低リスクだが、**改善余地あり**。

---

## 4. 運用設定 — セキュリティ運用設定.md

コードでは強制できない **本番 Dashboard 設定** のメモ。

### 4.1 Supabase Auth

| 設定 | 推奨 |
|---|---|
| JWT expiry | 3600 秒 |
| Refresh token rotation | 有効 |
| メール認証 | 本番で有効 |
| Auth rate limit | 既定値以上に緩めない |
| CAPTCHA | 不正ログイン観測時に有効化 |

### 4.2 リリースチェックリスト

```
[ ] anon key に service_role を使っていない
[ ] npm run audit が成功
[ ] HSTS / CSP ヘッダーが返る
[ ] Auth rate limit 有効
```

---

## 5. npm audit

**package.json:**

```json
"audit": "npm audit --audit-level=high",
"audit:prod": "npm audit --omit=dev --audit-level=high"
```

依存ライブラリの既知 CVE をチェック。`found 0 vulnerabilities` を CI で維持。

---

## 6. .env のベストプラクティス

```env
# ✅ ブラウザ OK
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...

# ✅ サーバー専用（NEXT_PUBLIC_ なし）
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
```

`.gitignore` に `.env*.local` があること。本番は Vercel 等の Secret 管理。

---

## 7. 中級者チェックリスト

- [ ] anon と service_role の権限差を説明できる
- [ ] 退会 API だけ service_role を使う理由
- [ ] `getSupabasePublicEnv` が起動時に throw する条件を3つ挙げられる
- [ ] Dashboard で確認すべき Auth 設定を説明できる
