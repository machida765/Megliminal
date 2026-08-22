# Docker（ローカル Supabase）起動・停止

PC 上で Supabase を Docker コンテナとして動かす手順です。  
Next.js アプリ本体は Docker の**外**で動きます（`npm run dev`）。

関連: `環境構成.md`（3モード全体）、`.env.local.example`（環境変数の雛形）

---

## 前提

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) をインストール済みであること
2. 作業ディレクトリがプロジェクトルート（`Megliminal`）であること
3. `.env.local` が Docker 用になっていること:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=（npm run supabase:status の anon key）
```

---

## コマンド一覧

| やりたいこと | コマンド |
|--------------|----------|
| **起動** | `npm run supabase:start` |
| **状態確認** | `npm run supabase:status` |
| **停止** | `npm run supabase:stop` |
| **DB 初期化（スキーマ + シード）** | `npx supabase db reset` |
| **アプリ起動** | `npm run dev` |
| **アプリ停止** | ターミナルで `Ctrl + C` |

`package.json` 内の実体:

| npm スクリプト | 中身 |
|----------------|------|
| `supabase:start` | `npx supabase start` |
| `supabase:stop` | `npx supabase stop` |
| `supabase:status` | `npx supabase status` |

---

## 起動手順（日常）

PowerShell またはターミナルで:

```powershell
cd "C:\Users\zombi\Desktop\開発\Megliminal"

# 1. Docker Desktop を起動して Running にしておく

# 2. ローカル Supabase を起動
npm run supabase:start

# 3. URL / anon key を確認（.env.local と一致しているか）
npm run supabase:status

# 4. Next.js を起動
npm run dev
```

ブラウザで `http://localhost:3000` を開く。  
ナビ左のバッジが **Docker** なら、ローカル Supabase に接続できている。

### 主な URL（起動後）

| 用途 | URL |
|------|-----|
| アプリ | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Studio（DB 管理） | http://127.0.0.1:54323（status で確認） |
| メール確認（Mailpit） | http://127.0.0.1:54324 |

---

## 停止手順

### Supabase（Docker コンテナ）だけ止める

```powershell
npm run supabase:stop
```

`npm run dev` は別ターミナルなので、止めたい場合はそちらで `Ctrl + C`。

### データも捨てて完全停止したいとき

```powershell
npx supabase stop --no-backup
```

次回 `supabase:start` から最初の状態になる。必要なら `npx supabase db reset` でスキーマを入れ直す。

---

## 初回 or DB を空にしたあと

スキーマと開発用データを入れる:

```powershell
npx supabase db reset
```

- マイグレーション: `supabase/migrations/`
- シード: `supabase/seed-dev.sql`（`supabase/config.toml` で指定）

---

## ログイン（Docker モード）

Google ログインは**クラウド Supabase 向け**。Docker ではメール/パスワードを使う。

### 新規登録

1. `/signup` でメール・パスワードを登録
2. ローカルはメール確認 OFF なので、そのまま `/login` からログイン可能

### シードユーザー（`db reset` 済みの場合）

| メール | パスワード |
|--------|------------|
| `dev-seed-001@megliminal.dev` | `dev-seed-password` |
| `dev-seed-002@megliminal.dev` | 同上 |

---

## 注意（Docker Desktop の UI）

**Docker Desktop の Compose「Start」ボタンから `megliminal` を起動しない。**

このリポジトリにはルートの `docker-compose.yml` がなく、Supabase CLI が内部でコンテナを管理する。  
Desktop から起動すると次のようなエラーになることがある:

```
no container found for project "megliminal": not found
```

**正しい方法はターミナルの `npm run supabase:start` のみ。**  
Docker Desktop は「起動しておく」用途だけでよい。

---

## よくあるエラー

| 症状 | 対処 |
|------|------|
| `Cannot connect to Docker` | Docker Desktop を起動 |
| `container is not running: exited` | `npm run supabase:stop` → `npm run supabase:start` |
| ポート競合 | 54321 等を使うプロセスを止める、または `supabase:stop` |
| バッジが Cloud のまま | `.env.local` の URL が `127.0.0.1:54321` か、dev サーバー再起動 |
| 投稿・ユーザーが空 | `npx supabase db reset` |

---

## 2モードとの関係

| モード | Docker 要否 | 起動 |
|--------|-------------|------|
| **Docker** | 必要 | `supabase:start` → `npm run dev` |
| **Cloud** | 不要 | `npm run dev` のみ（`.env.local` をクラウド URL に） |

切り替えは `.env.local` を書き換え、**`npm run dev` を再起動**する。
