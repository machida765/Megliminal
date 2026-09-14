# API仕様書

最終更新: 2026-09-14

このアプリに **公開 REST API（`/api/v1/...`）はない**。  
ブラウザ ↔ アプリのデータのやりとりは次の 2 系統に分かれる。

| 系統 | 経路 | 用途 |
| --- | --- | --- |
| **A. Supabase 直結** | `@supabase/supabase-js` → PostgREST / Auth | 投稿・いいね・コメント等のほぼすべて |
| **B. Next.js Route** | `app/api/...` / `app/auth/...` | 退会・OAuth コールバックのみ |

画面コードは A を直接叩かず、`getRepository()`（`lib/data`）経由で触る。  
権限の正本は **Supabase RLS**（[`テーブル定義書.md`](../テーブル定義/テーブル定義書.md)）。

関連: [`退会処理設計.md`](../詳細設計/退会処理設計.md) / [`ソース案内.md`](../ソース案内.md) / [`セキュリティ運用設定.md`](../セキュリティ運用設定.md)

---

## 1. 概要

```
Browser
  ├─ AuthProvider / supabase client  ──► Supabase Auth / PostgREST（RLS）
  ├─ getRepository()                 ──► 同上（アプリ層のバリデーション付き）
  └─ fetch('/api/...')               ──► Next.js API Route（退会のみ）
```

| 項目 | 内容 |
| --- | --- |
| ベース URL（アプリ） | ローカル `http://localhost:3000` |
| ベース URL（Supabase） | `.env.local` の `NEXT_PUBLIC_SUPABASE_URL`（例: `http://127.0.0.1:54321`） |
| クライアントキー | `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Publishable）。**service_role は載せない** |
| サーバー専用キー | `SUPABASE_SERVICE_ROLE_KEY`（退会 API のみ） |
| 認証方式 | Supabase Auth セッション（Cookie / ローカルストレージ）。独自 JWT は発行しない |
| データ形式 | JSON（API Route）/ Supabase 行（camelCase へ repository が変換） |

---

## 2. 認証

### 2.1 ログイン手段

| 手段 | 入口 | 実装の場所 |
| --- | --- | --- |
| メール + パスワード | `/login` `/signup` | `AuthProvider` → `supabase.auth.signInWithPassword` / `signUp` |
| Google OAuth | ログイン画面のボタン | `signInWithOAuth` → Supabase → **`GET /auth/callback`** |
| パスワードリセット | `/forgot-password` → メール → `/reset-password` | `supabase.auth.resetPasswordForEmail` 等 |

### 2.2 保護ページ

`lib/supabase/middleware.ts` が未ログインを `/login?redirect=...` へ飛ばす。

| パス | 条件 |
| --- | --- |
| `/create` | ログイン不要（掲示板モード） |
| `/bookmarks` `/profile/edit` `/settings` `/reset-password` | ログイン必須 |
| `/post/[id]/edit` | ログイン必須（所有者チェックは repository / RLS） |
| `/admin` | ログイン + `profiles.role === 'admin'` |

`redirect` / OAuth の `next` は `getSafeRedirectPath` で **同一オリジンの `/` 始まり**のみ許可。

---

## 3. Next.js エンドポイント（自前 API）

### 3.1 `GET /auth/callback`

OAuth 完了後、Supabase から渡された `code` をセッションに交換する。

| | |
| --- | --- |
| ファイル | `app/auth/callback/route.ts` |
| 認証 | 不要（code 自体がワンタイム） |

**クエリ**

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| `code` | ○ | Supabase が返す認可コード |
| `next` | × | 成功後の遷移先。未指定は `/`。危険な値は `/` に落とす |

**挙動**

| 結果 | レスポンス |
| --- | --- |
| 成功 | `302` → `{origin}{safeNext}` |
| 失敗・code なし | `302` → `{origin}/login?error=auth_callback` |

---

### 3.2 `POST /api/account/delete`

アカウントの物理削除。`service_role` は **この Route 内だけ**で使う。詳細は [`退会処理設計.md`](../詳細設計/退会処理設計.md)。

| | |
| --- | --- |
| ファイル | `app/api/account/delete/route.ts` |
| 認証 | 必須（Cookie セッション。`createClient()` の `getUser()`） |
| Content-Type | `application/json` |

**リクエストボディ**

```json
{
  "password": "現在のパスワード（メール登録ユーザー）",
  "confirmPhrase": "退会する（OAuth のみユーザー）"
}
```

| フィールド | 条件 |
| --- | --- |
| `password` | `identities` に `email` があるユーザーは必須。`signInWithPassword` で再検証 |
| `confirmPhrase` | OAuth のみユーザーは必須。値は固定文字列 **`退会する`** |

**成功レスポンス** `200`

```json
{ "success": true }
```

削除成功後、サーバー側で `signOut({ scope: 'global' })` する。関連行は DB の `ON DELETE CASCADE` で消える。

**エラーレスポンス**

| HTTP | `error` | 意味 |
| --- | --- | --- |
| 401 | `unauthorized` | 未ログイン / セッション無効 |
| 400 | `invalid_body` | JSON 不正 or Zod 失敗 |
| 400 | `password_required` | メールユーザーなのに password なし |
| 400 | `confirm_phrase_required` | OAuth ユーザーでフレーズ不一致 |
| 400 | `invalid_account` | メールユーザーなのに email が取れない |
| 403 | `invalid_password` | パスワード再検証失敗 |
| 500 | `delete_failed` | `auth.admin.deleteUser` 失敗 |
| 503 | `service_unavailable` | service_role 未設定など |

```json
{ "error": "invalid_password" }
```

**呼び出し例（ブラウザ）**

```ts
await fetch('/api/account/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '...' }),
});
```

UI: `components/settings/DeleteAccountSection.tsx`（`/profile/edit#delete-account`）

---

## 4. データ操作 API（DataRepository）

画面・hooks から見える「アプリ内部 API」。実装は `lib/data/supabase-repository.ts`。  
HTTP パスはなく、Supabase テーブルへ RLS 付きでアクセスする。

入口:

- クライアント: `getRepository()`（`lib/data/index.ts`）
- サーバー（トップ ISR 等）: `getPublicRepository()`（`lib/data/server.ts`）
- React Query ラッパ: `lib/data/hooks.ts` の `usePosts` / `useComments` など

### 4.1 一覧

#### マスタ・ホーム

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `getMajorCategories` | 大カテゴリ一覧 | 誰でも読める |
| `getSubCategories` | 中カテゴリ一覧 | 誰でも読める |
| `getTags` | タグ一覧 | 誰でも読める |
| `getHomePageData` | トップ用スナップショット | 誰でも読める（ISR 可） |
| `upsertMajorCategory` | 大カテゴリ作成・更新 | **admin** |
| `deleteMajorCategory` | 大カテゴリ削除（投稿があるとアプリ層で拒否） | **admin** |
| `reorderMajorCategories` | 並び替え | **admin** |

#### 投稿

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `getPosts` / `getPost` / `getPostsByUser` | 一覧・詳細（viewer の非表示を除外） | 誰でも読める |
| `createPost` | 作成（Zod + 週1制限は DB trigger も強制） | 本人名義のみ |
| `updatePost` | 更新 | 所有者のみ |
| `deletePost` / `deletePosts` | 削除 | 所有者 or **admin** |
| `checkPostFrequency` | 週1制限の事前チェック（UX 用） | ログインユーザー |

#### ユーザー

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `getUser` / `getProfile` | 公開プロフィール | 誰でも読める |
| `updateUser` | 表示名・アバター | 本人のみ（`role` はトリガーで固定） |

#### コメント

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `getComments` | 投稿のコメント一覧 | 誰でも読める |
| `addComment` | 追加（本文 1〜1000 文字） | 本人名義のみ |
| `updateComment` | 編集 | 本人のみ |
| `deleteComment` | 削除 | 本人 or **admin** |

#### いいね

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `isLiked` / `getLikedPostIds` / `getLikes` | 状態・一覧 | 読める |
| `addLike` / `removeLike` | 付与・解除（`posts.like_count` は DB trigger） | 本人名義のみ |

#### ブックマーク

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `getBookmarks` / `isBookmarked` | 自分の保存一覧 | **本人の行のみ**見える |
| `addBookmark` / `removeBookmark` | 追加・解除 | 本人名義のみ |

#### ランキング

| メソッド | 説明 |
| --- | --- |
| `getPostRankings({ period, categoryId?, limit? })` | 全期間は `like_count` で DB ソート。週/月は期間内 likes を集計 |
| `getUserRankings({ period, sortBy, limit? })` | `sortBy`: `posts` \| `likes` |

#### 通報・非表示

| メソッド | 説明 | 主な権限 |
| --- | --- | --- |
| `reportPost` | 通報（同一投稿は upsert） | 本人名義のみ。一覧は通報者 or **admin** |
| `getReports` / `resolveReports` | 一覧・解決 | **admin**（解決は update） |
| `hidePost` / `unhidePost` / `isPostHidden` | 自分のタイムラインから隠す | 本人のみ |

### 4.2 入力の制約（Zod）

定義: `lib/validation/data.ts`

| 対象 | 主なルール |
| --- | --- |
| 投稿タイトル | 1〜100 文字 |
| 投稿本文 | 1〜1000 文字 |
| 投稿 URL | http / https のみ（表示時も `getSafeHttpUrl`） |
| コメント本文 | 1〜1000 文字 |
| 通報理由 | `spam` \| `inappropriate` \| `misinformation` \| `other` |
| アバター URL | 安全な相対パス or http(s) |
| ユーザー / 投稿 ID | UUID |

アプリ層で弾いたあとも、RLS・DB CHECK・週1 trigger が最後の防御になる。

### 4.3 代表的な型（レスポンスイメージ）

投稿（`Post`）— repository が Supabase 行を camelCase に変換した形:

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "userId": "22222222-2222-4222-8222-222222222222",
  "user": { "id": "...", "name": "表示名", "avatarUrl": "/avatars/a.png" },
  "majorCategoryId": "cat-anime",
  "subCategoryId": null,
  "tagIds": ["tag-recommend"],
  "title": "おすすめの一本",
  "description": "見てほしい理由",
  "url": "https://example.com",
  "createdAt": "2026-09-01T12:00:00.000Z",
  "likeCount": 3
}
```

---

## 5. Supabase 側で触る主なテーブル

詳細カラムは [`テーブル定義書.md`](../テーブル定義/テーブル定義書.md)。アプリがよく触るもの:

| テーブル | 用途 |
| --- | --- |
| `profiles` | 表示名・role・アバター |
| `major_categories` / `sub_categories` / `tags` | マスタ |
| `posts` / `post_tags` | 投稿 |
| `likes` / `comments` / `bookmarks` | 交流 |
| `reports` / `hidden_posts` | モデレーション |

Auth ユーザー削除 → `profiles` CASCADE → 投稿・いいね等も連鎖削除。

---

## 6. セキュリティ上の約束

| 項目 | 方針 |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー専用。クライアント・`NEXT_PUBLIC_*` に出さない |
| 書き込み | 原則 RLS。退会だけ service_role |
| CSRF | セッション Cookie の SameSite + Supabase。独自 POST を増やすときは [`セキュリティ運用設定.md`](../セキュリティ運用設定.md) を更新 |
| リダイレクト | `getSafeRedirectPath` で外部 URL を拒否 |
| IDOR | repository の `assertActingAs` / `assertCanChangePosts` + RLS |

---

## 7. 更新履歴

| 日付 | 内容 |
| --- | --- |
| 2026-09-01 | 現状実装に合わせて全面改訂（架空の `/api/v1/posts` を削除。退会 API・callback・DataRepository を記載） |
| （初版） | `/api/v1/posts` 案のみのスケルトン |
