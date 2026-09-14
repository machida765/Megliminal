# 03. XSS・CSRF・セキュリティヘッダー

## 1. XSS（Cross-Site Scripting）

### 1.1 React のデフォルト防御

```tsx
<h1>{post.title}</h1>   // ✅ 自動エスケープ
```

```tsx
<div dangerouslySetInnerHTML={{ __html: post.title }} />  // ❌ 使っていない
```

Megliminal ではユーザー入力は **テキストノード** として描画。これだけで多くの XSS は防げる。

### 1.2 URL ベース XSS — `javascript:` スキーム

攻撃例:

```
post.url = "javascript:alert(document.cookie)"
```

`<a href={post.url}>` とするとクリック時に JS 実行。

#### 対策1: 保存前 Zod

**ファイル:** `lib/validation/data.ts`

```typescript
const httpUrlSchema = z.string().refine((value) => {
  const url = new URL(value);
  return url.protocol === 'http:' || url.protocol === 'https:';
});
```

#### 対策2: 表示前フィルタ

```typescript
export function getSafeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = httpUrlSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
```

**ファイル:** `components/post/PostDetail.tsx`

```tsx
const safePostUrl = getSafeHttpUrl(post.url);
{safePostUrl && <a href={safePostUrl}>...</a>}
```

**なぜ表示時も検証？** 過去データ・DB 直接操作・マイグレーション漏れの保険。

### 1.3 アバター URL

**ファイル:** `lib/avatars/index.ts` + `lib/validation/data.ts` の `avatarUrlSchema`

許可:

- `/avatars/042.svg`（相対パス、`..` 禁止）
- `https://...`（http(s) のみ）

禁止:

- `javascript:...`
- `//evil.com/...`

---

## 2. CSP（Content-Security-Policy）

**ファイル:** `next.config.ts`

```typescript
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' blob: data: https:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self' https: wss:${devSupabaseConnectSrc}`,
  ...
].join("; ");
```

### 各ディレクティブの意味

| ディレクティブ | 意味 |
|---|---|
| `default-src 'self'` | デフォルトは同一オリジンのみ |
| `script-src` | JS の読み込み元 |
| `connect-src` | fetch/WebSocket 先（Supabase API） |
| `img-src https:` | 外部 HTTPS 画像（アバター等） |
| `frame-ancestors 'none'` | iframe 埋め込み拒否（クリックジャッキング） |

### `'unsafe-inline'` について

Next.js / Tailwind / 開発 HMR の都合で **完全 strict CSP は難しい**。

現状は「インライン script も許可」寄り → **XSS 対策の主役は React エスケープ + URL 検証**。

本番で `'unsafe-eval'` を外しているのは良い判断。

### 確認方法

```bash
curl -I http://localhost:3000
# または本番 URL
```

Response Headers に `content-security-policy` があるか確認。

---

## 3. その他のセキュリティヘッダー

| ヘッダー | 効果 |
|---|---|
| `Strict-Transport-Security` | 本番のみ。以後 HTTP アクセス禁止 |
| `X-Frame-Options: DENY` | iframe 埋め込み拒否 |
| `X-Content-Type-Options: nosniff` | MIME スニッフィング防止 |
| `Referrer-Policy` | Referer 漏洩抑制 |
| `Permissions-Policy` | カメラ・マイク無効 |

---

## 4. CSRF（Cross-Site Request Forgery）

### 4.1 現在の構成

| 書き込み経路 | 認証方式 | CSRF リスク |
|---|---|---|
| Supabase REST（投稿・いいね等） | `Authorization: Bearer <JWT>` | **低**（Cookie だけでは叩けない） |
| `POST /api/account/delete` | Session Cookie | **要注意** |

### 4.2 なぜ Supabase 直叩きは CSRF しにくい？

悪意あるサイトの `<form>` は **Cookie は送れる** が、Supabase JS が付ける **Authorization ヘッダーは送れない**（同一オリジン JS でないと）。

### 4.3 退会 API の注意点

**ファイル:** `app/api/account/delete/route.ts`

Cookie セッション + JSON POST。理論上、SameSite=Lax な Cookie なら cross-site POST からは送りにくいが、**将来 Origin チェックや CSRF トークン追加**が望ましい。

**ファイル:** `設計書/セキュリティ運用設定.md` に方針記載済み。

---

## 5. テストで XSS ベクトルを確認

**ファイル:** `tests/unit/validation.test.ts`

例:

```typescript
expect(httpUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
expect(getSafeHttpUrl('javascript:alert(1)')).toBeNull();
```

**中級者の習慣:** セキュリティ関数には **拒否すべき入力の表** をテストで残す。

---

## 6. まとめ — XSS/CSRF の優先度

| 脅威 | Megliminal の主防御 | 強度 |
|---|---|---|
| 反射型 XSS（テキスト） | React エスケープ | 強 |
| DOM XSS（URL） | Zod + getSafeHttpUrl | 強 |
| インライン script 注入 | CSP（partial） | 中 |
| CSRF（Supabase 操作） | Bearer トークン | 強 |
| CSRF（退会 API） | SameSite Cookie | 中 |
