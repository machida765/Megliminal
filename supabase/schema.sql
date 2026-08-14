-- メグリミナル データベーススキーマ（ドラフト）
-- ⚠️ 画面完成後に最終確定してから Supabase SQL Editor で実行してください。
-- 現時点では NEXT_PUBLIC_DATA_SOURCE=local で画面開発を進められます。

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
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '👤'),
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
-- RLS 有効化
-- ─────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.major_categories enable row level security;
alter table public.sub_categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- major_categories / tags（全員読み取り可）
create policy "major_categories_select_all" on public.major_categories
  for select using (true);

create policy "sub_categories_select_all" on public.sub_categories
  for select using (true);

create policy "tags_select_all" on public.tags
  for select using (true);

-- posts
create policy "posts_select_all" on public.posts
  for select using (true);

create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "posts_update_own" on public.posts
  for update using (auth.uid() = user_id);

create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = user_id);

-- post_tags
create policy "post_tags_select_all" on public.post_tags
  for select using (true);

create policy "post_tags_insert_own" on public.post_tags
  for insert with check (
    exists (
      select 1 from public.posts
      where posts.id = post_id and posts.user_id = auth.uid()
    )
  );

create policy "post_tags_delete_own" on public.post_tags
  for delete using (
    exists (
      select 1 from public.posts
      where posts.id = post_id and posts.user_id = auth.uid()
    )
  );

-- likes
create policy "likes_select_all" on public.likes
  for select using (true);

create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- comments
create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_update_own" on public.comments
  for update using (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

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
