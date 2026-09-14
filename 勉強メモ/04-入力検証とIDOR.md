# 04. 入力検証と IDOR — ソース解説

## 1. なぜ「HTML の maxLength だけ」ではダメか

```tsx
<Input maxLength={100} />
```

ブラウザ DevTools や curl で **maxLength を無視したリクエスト** を送れる。

| 層 | 誰を止める |
|---|---|
| maxLength | 普通のユーザー（UX） |
| Zod | 改ざんリクエスト |
| DB CHECK | Supabase API 直叩き |

---

## 2. Zod スキーマ — lib/validation/data.ts

### 2.1 投稿作成

```typescript
export const createPostSchema = z.object({
  userId: uuidSchema,
  majorCategoryId: idSchema,
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000),
  url: httpUrlSchema.optional(),
});
```

**repository での使い方:**

```typescript
async createPost(input: CreatePostInput) {
  const validated = createPostSchema.parse(input);
  await this.assertActingAs(validated.userId);
  await this.client.from('posts').insert({ ... });
}
```

`.parse()` は失敗時に throw → 不正データが DB まで行かない。

### 2.2 部分更新 — updatePostSchema

```typescript
export const updatePostSchema = createPostSchema
  .omit({ userId: true })
  .partial()
  .extend({ url: httpUrlSchema.nullable().optional() })
  .refine((value) => Object.keys(value).length > 0, '更新内容がありません');
```

- `partial()` … 送られたフィールドだけ更新
- `url: null` … リンク削除を明示

### 2.3 アバター URL

```typescript
const avatarUrlSchema = z.string().refine(
  (value) =>
    (/^\/(?!\/)(?!.*\\).../.test(value) && !value.includes('..')) ||
    httpUrlSchema.safeParse(value).success,
  '安全な画像URLを指定してください'
);
```

- `/avatars/042.svg` ✅
- `/../etc/passwd` ❌
- `https://example.com/x.png` ✅

---

## 3. DB 側 CHECK — 二重防御

**ファイル:** `supabase/migrations/20260822120000_security_constraints.sql`

```sql
alter table public.posts
  add constraint posts_title_length
    check (char_length(btrim(title)) between 1 and 100) not valid,
  add constraint posts_url_safe
    check (
      url is null or (
        char_length(url) <= 2048
        and url ~* '^https?://'
      )
    ) not valid;
```

### NOT VALID とは

既存行には適用せず、**新規 INSERT/UPDATE だけ** チェック。マイグレーション時の既存データ矛盾を避ける。

---

## 4. IDOR 対策 — repository の assert 系

**ファイル:** `lib/data/supabase-repository.ts`

### 4.1 assertActingAs — 「なりすまし」防止

```typescript
private async assertActingAs(userId: string): Promise<void> {
  const authenticatedUserId = await this.getAuthenticatedUserId();
  if (validatedUserId !== authenticatedUserId) {
    throw new Error('他のユーザーとして操作することはできません。');
  }
}
```

**使う場面:** createPost, addComment, like, bookmark, report, hidePost, updateUser

JSON body に `userId: "他人のUUID"` を入れても拒否。

### 4.2 assertCanChangePosts — 投稿オブジェクト権限

```typescript
private async assertCanChangePosts(ids: string[], allowAdmin = false) {
  const { data } = await this.client
    .from('posts')
    .select('id, user_id')
    .in('id', uniqueIds);

  if (data.every((post) => post.user_id === authenticatedUserId)) {
    return uniqueIds;
  }

  if (allowAdmin) {
    const { data: profile } = await this.client
      .from('profiles')
      .select('role')
      .eq('id', authenticatedUserId)
      .single();
    if (profile?.role === 'admin') return uniqueIds;
  }

  throw new Error('この投稿を変更する権限がありません。');
}
```

**設計のポイント:**

1. 先に DB から `user_id` を読む（クライアント送信値を信頼しない）
2. admin 削除は `allowAdmin: true` で明示的に opt-in

---

## 5. 投稿頻度 — レースコンディション対策

### 5.1 クライアント側（UX）

**ファイル:** `lib/post-frequency.ts` + `PostForm.tsx`

投稿前に「7日以内に同カテゴリ投稿あり」をチェック → 早くエラー表示。

### 5.2 DB trigger（本番防御）

```sql
perform pg_advisory_xact_lock(
  hashtextextended(new.user_id::text || ':' || new.major_category_id, 0)
);

if exists (
  select 1 from public.posts
  where user_id = new.user_id
    and major_category_id = new.major_category_id
    and created_at > now() - interval '7 days'
) then
  raise exception '同じ大カテゴリへの投稿は7日間に1回までです。';
end if;

new.created_at := now();  -- 過去日時指定の回避
```

### advisory lock とは

**同一トランザクション内**で同じユーザー+カテゴリの INSERT を直列化。

2 タブ同時投稿 → 両方「投稿なし」と判定 → 2 件入る、を防ぐ。

---

## 6. Defense in Depth まとめ図（投稿削除）

```
[攻撃] deletePost('他人のpost-id')
        │
        ▼
[Layer 4] assertCanChangePosts
        │ user_id 不一致 → throw
        ▼ (迂回)
[Layer 6] RLS posts_delete_own
        │ auth.uid() ≠ user_id → 0 rows
        ▼
      安全
```

---

## 7. 演習問題

1. `createPostSchema` に `tagIds` を 21 個入れたらどうなる？（`.max(20)`）
2. `updatePost` で `userId` を body に含められる？（`updatePostSchema` は omit 済み）
3. integration test で「週2回投稿」を試すテストがあるか探す（`post-crud.spec.ts`）
