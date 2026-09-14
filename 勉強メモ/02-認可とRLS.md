# 02. 認可と RLS — ソース解説

## 1. 認可の3段構え

| 段 | 場所 | 役割 | すり抜けたら |
|---|---|---|---|
| 1 | middleware | ページ単位（ログイン / admin） | ページは見えるが… |
| 2 | React UI | ボタン表示（isOwner） | DevTools で操作可能 |
| 3 | **RLS** | DB 行単位 | **ここで必ず止まる** |

Megliminal は **3 が正本**。1・2 は UX と早期拒否。

---

## 2. middleware の admin ガード

**ファイル:** `lib/supabase/middleware.ts`

```typescript
if (isAdminPath && user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAdminRole(profile?.role)) {
    url.pathname = '/';
    url.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(url);
  }
}
```

### なぜ DB から role を読む？

`user` オブジェクト（JWT）だけでは `role` が載っていない。`profiles.role` が正本。

### 二重チェック

**ファイル:** `app/admin/page.tsx` — クライアントでも `isAdminRole(profile?.role)` を確認。

middleware を bypass しても（理論上）、UI は「権限がありません」を表示。データ操作は RLS が拒否。

---

## 3. RLS ポリシー読み方

**ファイル:** `supabase/migrations/20260819000000_init.sql`

### 3.1 posts（投稿）

```sql
-- 誰でも読める
create policy "posts_select_all" on public.posts
  for select using (true);

-- 作成は本人名義のみ
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

-- 更新は本人のみ
create policy "posts_update_own" on public.posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 削除: 本人 OR admin
create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = user_id);

create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());
```

**PostgreSQL の OR ルール:** 複数 DELETE ポリシーは **どれか1つでも true なら許可**。

### 3.2 profiles — role 昇格防止

**トリガー:** `protect_profile_immutable`

```sql
if auth.uid() is not null then
  new.role := old.role;  -- クライアントから role 変更不可
end if;
```

DevTools で `profiles.role = 'admin'` を UPDATE しても、DB が元に戻す。

最初の admin は **SQL Editor** で手動付与:

```sql
update public.profiles set role = 'admin' where id = '<uuid>';
```

### 3.3 is_admin() ヘルパー

```sql
create or replace function public.is_admin()
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

- `SECURITY DEFINER` … 関数実行時だけ定義者権限（RLS 再帰回避）
- RLS ポリシー内で `public.is_admin()` を呼ぶ

---

## 4. 投稿の編集・削除 — 実際の流れ

### 4.1 一般ユーザーが自分の投稿を削除

**UI:** `components/post/PostDetail.tsx` — `isOwner` のとき削除ボタン

**Repository:**

```typescript
async deletePost(id: string) {
  await this.deletePosts([id]);
}

async deletePosts(ids: string[], allowAdmin = false) {
  const validatedIds = await this.assertCanChangePosts(ids, allowAdmin);
  await this.client.from('posts').delete().in('id', validatedIds);
}
```

**assertCanChangePosts:**

1. 投稿 ID を DB から取得
2. 全部 `user_id === ログイン中` なら OK
3. `allowAdmin: true` のとき、1件でも他人の投稿があれば `profiles.role` を確認

**RLS:** `posts_delete_own` が最終確認。

### 4.2 他人の投稿を削除しようとした場合

```
DevTools で deletePost(他人のUUID)
  → assertCanChangePosts: エラー「権限がありません」
  → 万が一 repository を迂回
  → RLS: auth.uid() ≠ user_id → 0 rows deleted
```

### 4.3 admin の一括削除

**ファイル:** `components/moderation/AdminModeration.tsx`

```typescript
await getRepository().deletePosts(ids);  // allowAdmin: true 内部
```

RLS の `posts_delete_admin` が効く。

---

## 5. 編集ページの UI ガード

**ファイル:** `app/post/[id]/edit/page.tsx`

```typescript
const isOwner = post?.userId === user?.id;
if (!isOwner) {
  return <p>{t('post.noEditPermission')}</p>;
}
```

middleware は **ログインさえしていれば** 編集 URL にアクセス可能。所有者チェックはページ側。

保存時は `assertCanChangePosts` + RLS で拒否されるので **セキュリティ上は安全**。

---

## 6. コメント・いいね・ブックマーク

| 操作 | repository | RLS |
|---|---|---|
| コメント追加 | `assertActingAs(userId)` | `comments_insert_own` |
| コメント編集 | `.eq('user_id', authenticatedUserId)` | `comments_update_own` |
| いいね | `assertActingAs` + upsert | `likes_insert_own` |
| ブックマーク | `assertActingAs` | `bookmarks_*` |
| 通報 | `assertActingAs(reporterId)` | `reports_insert_own` |

---

## 7. RLS 結合テストで何を確認しているか

**ファイル:** `tests/integration/rls.test.ts`

別ユーザーのクライアントを作り、以下を **実際に Supabase に投げて** 確認:

- 他人の post を update/delete → 失敗
- 他人の comment を update → 失敗
- 一般ユーザーが category を insert → 失敗
- admin が category を insert → 成功

**これが「本当に効いている」証拠。** ユニットテストだけでは RLS は検証できない。

---

## 8. 中級者向け演習

1. `supabase/schema.sql` を開き、`posts` の policy を全部読む
2. `assertCanChangePosts` の `allowAdmin` 分岐を trace する
3. integration test の「他人の投稿削除」ケースを実行:

```bash
npm run test:integration
```

4. Supabase SQL Editor で一般ユーザー JWT コンテキストを模倣する方法を調べる（`set request.jwt.claim.sub` 等）
