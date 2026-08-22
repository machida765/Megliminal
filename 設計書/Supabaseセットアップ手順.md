# Supabase セットアップ手順（初めての方向け）

> **注意:** DB スキーマ（`okini/supabase/schema.sql`）は **ドラフト** です。  
> 全画面が完成してから最終確定し、SQL を実行してください。  
> **注意:** DB スキーマは画面完成後に最終確定して実行してください。データは Docker またはクラウドの Supabase です。

メグリミナルの Supabase 連携では **認証（ログイン/登録）** と **データベース** を使います。
データソースの切り替え方法は [`データソース切り替え.md`](./データソース切り替え.md) を参照してください。

---

## Supabase とは？

- **認証**: メール + パスワードでユーザー登録・ログイン
- **データベース**: PostgreSQL。投稿・カテゴリ・いいねなどを保存
- **RLS（Row Level Security）**: 「誰がどのデータを読める/書けるか」を DB 側で制御

メグリミナルでは Next.js アプリから Supabase の API を呼び出します。

---

## Step 1: Supabase アカウントとプロジェクト作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. **Start your project** から GitHub 等でサインアップ
3. ダッシュボードで **New project** をクリック
4. 以下を入力:
   - **Name**: `meguriminal`（任意）
   - **Database Password**: 強いパスワード（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
5. **Create new project** を押す（1〜2分待つ）

---

## Step 2: API キーを取得

Supabase の画面は **Connect ボタン** か **Settings > API Keys** から取れます。
「anon public」という名前が出ない場合もあります（新 UI では **Publishable key** と表示されます）。

### 方法 A（いちばん簡単）: Connect ボタン

1. プロジェクトを開いた状態で、画面上部の **Connect** ボタンをクリック
2. フレームワークは **Next.js** を選ぶ（任意）
3. 表示される **Project URL** と **API Key** をコピー

### 方法 B: Settings から

1. 左下の **歯車アイコン（Project Settings）** をクリック
2. 左メニューから **API Keys** を選ぶ
3. 次の2つをコピー:

| 画面に表示される名前 | 用途 | 例 |
|---|---|---|
| **Project URL** | アプリから Supabase への接続先 | `https://xxxxx.supabase.co` |
| **Publishable key** または **anon public** | ブラウザから使う公開キー | `sb_publishable_...` または `eyJ...` |

> **Publishable key**（`sb_publishable_...`）と **anon public**（`eyJ...`）はどちらもクライアント側で使えます。  
> 新しいプロジェクトは Publishable key だけの場合があります。

4. `okini` フォルダ直下に `.env.local` を作成:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ここに Publishable key または anon public キー
```

5. 開発サーバーを再起動:

```bash
npm run dev
```

### 見つからないときのチェック

- **プロジェクトの中に入っているか** … 組織一覧ではなく、`meguriminal` プロジェクトを開いた状態か
- **作成直後か** … 1〜2分待ってから再度開く（Provisioning 中は設定が出ないことがある）
- **Legacy タブ** … API Keys 画面に **Legacy API Keys** タブがあれば、そこに `anon` キーがある
- **service_role / Secret key は使わない** … サーバー専用なので `.env.local` には入れない

> `.env.local` は Git にコミットしない（`.gitignore` 済み）

---

## Step 3: データベーステーブルを作成

1. Supabase ダッシュボード左メニュー **SQL Editor**
2. **New query** をクリック
3. リポジトリ内 [`okini/supabase/schema.sql`](../okini/supabase/schema.sql) の内容を **すべてコピー**
4. SQL Editor に貼り付けて **Run** を実行
5. 成功メッセージが出れば OK

作成されるもの:

| テーブル | 用途 |
| --- | --- |
| `profiles` | ユーザー名・アバター・権限 |
| `major_categories` | 大カテゴリ |
| `tags` | 横断タグ |
| `posts` | 投稿 |
| `post_tags` | 投稿とタグの紐付け |
| `likes` | いいね |
| `comments` | コメント |

---

## Step 4: メール認証の設定（開発中）

開発中はメール確認をオフにすると楽です。

1. **Authentication** → **Providers** → **Email**
2. **Confirm email** を **OFF** にする（開発用）
3. 本番公開前には ON に戻すことを推奨

---

## Step 5: 動作確認

1. `npm run dev` でアプリ起動
2. `/signup` でアカウント作成
3. `/login` でログイン
4. ナビにユーザー名が表示され、**ログアウト** ボタンが出れば成功

Supabase ダッシュボード **Authentication** → **Users** にユーザーが増えていれば認証は動いています。

**Table Editor** → **profiles** にも、登録と同時に1行追加されます（トリガーで自動作成）。

---

## Step 6: Google ログイン（OAuth）

アプリ側は `/login`・`/signup` に **Google でログイン** ボタンを表示します。

### 6-1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクトを作成（または既存を選択）
3. **API とサービス** → **OAuth 同意画面**
   - User Type: **外部**（テスト中は「テスト」モードで OK）
   - アプリ名・サポートメールを入力して保存
   - **テストユーザー** に自分の Gmail を追加（テストモードの場合）
4. **API とサービス** → **認証情報** → **認証情報を作成** → **OAuth クライアント ID**
   - アプリケーションの種類: **ウェブアプリケーション**
   - **承認済みの JavaScript 生成元**:
     - `http://localhost:3000`（開発）
     - 本番 URL（デプロイ後）
   - **承認済みのリダイレクト URI**（重要）:
     - `https://<あなたの-project-ref>.supabase.co/auth/v1/callback`
     - 例: `https://rdfmqwqljebrmxejhumj.supabase.co/auth/v1/callback`
   - ⚠️ Google 側のリダイレクト先は **Supabase の URL** です。`localhost/auth/callback` ではありません。
5. **クライアント ID** と **クライアント シークレット** をコピー

### 6-2. Supabase ダッシュボード

1. **Authentication** → **Providers** → **Google** を **Enable**
2. Google の Client ID / Client Secret を貼り付けて保存
3. **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs** に追加:
     - `http://localhost:3000/auth/callback`
     - 本番: `https://your-domain.com/auth/callback`

### 6-3. 既に schema.sql を実行済みの場合（Google 用プロフィール）

Google ログインでは `full_name` / `picture` がメタデータに入ります。  
トリガーを更新していない場合、SQL Editor で以下を実行:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      '👤'
    ),
    'user'
  );
  return new;
end;
$$;
```

### 6-4. 動作確認

1. `.env.local` にプロジェクトの URL と anon key を入れる
2. `npm run dev` を再起動
3. `/login` → **Google でログイン**
4. Google アカウント選択 → アプリに戻る → ナビに名前が表示されれば OK

---

## よくあるつまずき

### 「Invalid API key」

- `.env.local` の URL / キーが間違っている
- 開発サーバーを再起動していない

### 登録できるが profiles に行がない

- `schema.sql` のトリガー部分が実行されていない → SQL を再実行

### ログイン後すぐログアウトされる

- ブラウザの Cookie がブロックされていないか確認
- `middleware.ts` が正しく配置されているか確認

### Google ログインで `redirect_uri_mismatch`

- Google Cloud の **承認済みのリダイレクト URI** が  
  `https://<project-ref>.supabase.co/auth/v1/callback` になっているか確認

### Google ログイン後に `/login?error=auth_callback` になる

- Supabase **URL Configuration** の Redirect URLs に  
  `http://localhost:3000/auth/callback` が入っているか確認
- 開発サーバーを再起動してから再試行

---

## このあと（Phase 3 以降）

- 投稿の作成・編集を `posts` テーブルに保存（ダミーデータから移行）
- 週1投稿制限を DB 側で強制
- いいね・コメントを Supabase に接続

Phase 2 完了時点では **認証と DB の土台** が整っている状態です。
