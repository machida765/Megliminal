-- メグリミナル データベーススキーマ（ドラフト）
-- 権限の正本は RLS。画面のボタン非表示は UX 用。書き込み用の自前 API は使わない。
-- ⚠️ 画面完成後に最終確定してから Supabase SQL Editor で実行してください。
-- 現時点では NEXT_PUBLIC_DATA_SOURCE=local で画面開発を進められます。
-- Local モードに RLS は無い。権限の確認は Supabase モードで行う。

-- ─────────────────────────────────────────
-- 拡張
-- ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- profiles（auth.users と 1:1）
-- ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text default '👤',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 新規登録時に profiles を自動作成
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────
-- major_categories（大カテゴリ）
-- ─────────────────────────────────────────
create table public.major_categories (
  id text primary key,
  name text not null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ─────────────────────────────────────────
-- sub_categories（中・小ジャンル）
-- ─────────────────────────────────────────
create table public.sub_categories (
  id text primary key,
  major_category_id text not null references public.major_categories(id),
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create index sub_categories_major_category_id_idx on public.sub_categories(major_category_id);

-- ─────────────────────────────────────────
-- tags（横断タグ）
-- ─────────────────────────────────────────
create table public.tags (
  id text primary key,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ─────────────────────────────────────────
-- posts（投稿）
-- ─────────────────────────────────────────
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  major_category_id text not null references public.major_categories(id),
  sub_category_id text references public.sub_categories(id),
  title text not null,
  description text not null,
  url text,
  like_count int not null default 0,
  created_at timestamptz not null default now()
);

create index posts_user_id_idx on public.posts(user_id);
create index posts_major_category_id_idx on public.posts(major_category_id);
create index posts_sub_category_id_idx on public.posts(sub_category_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- ─────────────────────────────────────────
-- post_tags（投稿 ↔ タグ）
-- ─────────────────────────────────────────
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id text not null references public.tags(id),
  primary key (post_id, tag_id)
);

-- ─────────────────────────────────────────
-- likes（いいね）
-- ─────────────────────────────────────────
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ─────────────────────────────────────────
-- comments（コメント）
-- ─────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- bookmarks（保存。本人以外は見えない）
-- ─────────────────────────────────────────
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

-- ─────────────────────────────────────────
-- reports（通報。一覧は本人または admin）
-- ─────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'inappropriate', 'misinformation', 'other')),
  detail text,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (post_id, reporter_id)
);

create index reports_status_created_at_idx on public.reports(status, created_at desc);

-- ─────────────────────────────────────────
-- hidden_posts（自分のフィードからのみ非表示）
-- ─────────────────────────────────────────
create table public.hidden_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ─────────────────────────────────────────
-- 権限ヘルパー（RLS の再帰を避けるため SECURITY DEFINER）
-- ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.owns_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.posts
    where id = p_post_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.owns_post(uuid) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_post(uuid) to authenticated;

-- role / 所有者 / いいね数はクライアントから書き換えない
create or replace function public.protect_profile_immutable()
returns trigger
language plpgsql
as $$
begin
  -- クライアント経由のみ固定。SQL Editor（auth.uid() が null）では role を付けられる。
  if auth.uid() is not null then
    new.id := old.id;
    new.role := old.role;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create or replace function public.protect_post_immutable()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.user_id := old.user_id;
    new.created_at := old.created_at;
    if current_setting('app.syncing_like_count', true) is distinct from 'on' then
      new.like_count := old.like_count;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_immutable
  before update on public.profiles
  for each row execute function public.protect_profile_immutable();

create trigger posts_protect_immutable
  before update on public.posts
  for each row execute function public.protect_post_immutable();

-- likes の増減だけ like_count を更新する
create or replace function public.sync_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.syncing_like_count', 'on', true);
  if tg_op = 'INSERT' then
    update public.posts
      set like_count = like_count + 1
      where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts
      set like_count = greatest(like_count - 1, 0)
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger likes_sync_post_like_count
  after insert or delete on public.likes
  for each row execute function public.sync_post_like_count();

-- ─────────────────────────────────────────
-- RLS（権限の正本。自前 API は使わない）
-- ポリシーが無い操作は拒否。画面のボタン非表示は UX 用。
-- ─────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.major_categories enable row level security;
alter table public.sub_categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;
alter table public.hidden_posts enable row level security;

-- profiles: 閲覧は公開。更新は本人のみ。role はトリガーで固定。INSERT は登録トリガーのみ。
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- マスタ: 閲覧は公開。変更は admin のみ。
create policy "major_categories_select_all" on public.major_categories
  for select using (true);

create policy "major_categories_write_admin" on public.major_categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "sub_categories_select_all" on public.sub_categories
  for select using (true);

create policy "sub_categories_write_admin" on public.sub_categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "tags_select_all" on public.tags
  for select using (true);

create policy "tags_write_admin" on public.tags
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- posts: 編集は本人のみ。削除は本人または admin。なりすまし作成は不可。
create policy "posts_select_all" on public.posts
  for select using (true);

create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "posts_update_own" on public.posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = user_id);

create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());

-- post_tags: 投稿の所有者だけ付け外し。admin は削除のみ（投稿削除に追随）。
create policy "post_tags_select_all" on public.post_tags
  for select using (true);

create policy "post_tags_insert_own" on public.post_tags
  for insert with check (public.owns_post(post_id));

create policy "post_tags_delete_own" on public.post_tags
  for delete using (public.owns_post(post_id));

create policy "post_tags_delete_admin" on public.post_tags
  for delete using (public.is_admin());

-- likes: 自分のいいねだけ付与・解除。他人名義は不可。
create policy "likes_select_all" on public.likes
  for select using (true);

create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- comments: 編集は本人。削除は本人または admin。
create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_update_own" on public.comments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

create policy "comments_delete_admin" on public.comments
  for delete using (public.is_admin());

-- bookmarks / hidden_posts: 本人の行以外は存在しないように見せる
create policy "bookmarks_select_own" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);

create policy "hidden_posts_select_own" on public.hidden_posts
  for select using (auth.uid() = user_id);

create policy "hidden_posts_insert_own" on public.hidden_posts
  for insert with check (auth.uid() = user_id);

create policy "hidden_posts_delete_own" on public.hidden_posts
  for delete using (auth.uid() = user_id);

-- reports: 作成は本人名義のみ。一覧・解決は admin。自分の通報は自分も読める。
create policy "reports_select_own_or_admin" on public.reports
  for select using (auth.uid() = reporter_id or public.is_admin());

create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_update_admin" on public.reports
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "reports_delete_admin" on public.reports
  for delete using (public.is_admin());

-- ─────────────────────────────────────────
-- 初期データ（大カテゴリ・タグ）
-- dummy.ts と同じ内容
-- ─────────────────────────────────────────
insert into public.major_categories (id, name, icon, sort_order, is_active) values
  ('youtube',  'YouTube',         'Youtube',          1,  true),
  ('books',    '本・書籍',        'BookOpen',         2,  true),
  ('movies',   '映画',            'Film',             3,  true),
  ('music',    '音楽',            'Music',            4,  true),
  ('games',    'ゲーム',          'Gamepad2',         5,  true),
  ('apps',     'アプリ・ツール',  'Cpu',              6,  true),
  ('food',     '飲食・グルメ',    'UtensilsCrossed',  7,  true),
  ('gadgets',  'ガジェット',      'Lightbulb',        8,  true),
  ('spots',    '場所・スポット',  'MapPin',           9,  true),
  ('other',    'その他',          'MoreHorizontal',   10, true);

insert into public.sub_categories (id, major_category_id, name, sort_order, is_active) values
  ('books-novel',        'books',   '小説',             1, true),
  ('books-nonfiction',   'books',   'ノンフィクション', 2, true),
  ('books-business',     'books',   'ビジネス書',       3, true),
  ('books-manga',        'books',   '漫画',             4, true),
  ('books-light-novel',  'books',   'ライトノベル',     5, true),
  ('books-essay',        'books',   'エッセイ',         6, true),
  ('yt-education',       'youtube', '解説・教育',       1, true),
  ('yt-vlog',            'youtube', 'Vlog',             2, true),
  ('yt-gaming',          'youtube', 'ゲーム実況',       3, true),
  ('yt-cooking',         'youtube', '料理',             4, true),
  ('yt-entertainment',   'youtube', 'エンタメ',         5, true),
  ('movies-action',      'movies',  'アクション',       1, true),
  ('movies-sf',          'movies',  'SF',               2, true),
  ('movies-drama',       'movies',  'ドラマ',           3, true),
  ('movies-anime',       'movies',  'アニメ映画',       4, true),
  ('movies-documentary', 'movies',  'ドキュメンタリー', 5, true),
  ('music-jpop',         'music',   'J-POP',            1, true),
  ('music-rock',         'music',   'ロック',           2, true),
  ('music-classical',    'music',   'クラシック',       3, true),
  ('music-jazz',         'music',   'ジャズ',           4, true),
  ('music-anime',        'music',   'アニソン',         5, true),
  ('games-rpg',          'games',   'RPG',              1, true),
  ('games-action',       'games',   'アクション',       2, true),
  ('games-indie',        'games',   'インディー',       3, true),
  ('games-board',        'games',   'ボードゲーム',     4, true);

insert into public.tags (id, name, sort_order, is_active) values
  ('mystery',     'ミステリ',         1,  true),
  ('sf',          'SF',               2,  true),
  ('horror',      'ホラー',           3,  true),
  ('romance',     '恋愛',             4,  true),
  ('business',    'ビジネス',         5,  true),
  ('selfhelp',    '自己啓発',         6,  true),
  ('cooking',     '料理',             7,  true),
  ('travel',      '旅行',             8,  true),
  ('tech',        'テクノロジー',     9,  true),
  ('comedy',      'コメディ',         10, true),
  ('documentary', 'ドキュメンタリー', 11, true),
  ('anime',       'アニメ',           12, true),
  ('indie',       'インディー',       13, true),
  ('education',   '教育・解説',       14, true),
  ('vlog',        'Vlog',             15, true);

-- 最初の admin は SQL Editor で付ける（クライアントからは昇格できない）
-- update public.profiles set role = 'admin' where id = '<auth.users の uuid>';
