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
declare
  avatar_index int;
begin
  avatar_index := abs(hashtext(new.id::text)) % 100;

  insert into public.profiles (id, name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', ''),
      '/avatars/' || lpad(avatar_index::text, 3, '0') || '.svg'
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
  user_id uuid references public.profiles(id) on delete cascade,
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
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ─────────────────────────────────────────
-- comments（コメント）
-- ─────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
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
  reporter_id uuid references public.profiles(id) on delete cascade,
  reporter_key text,
  reason text not null check (reason in ('spam', 'inappropriate', 'misinformation', 'other')),
  detail text,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reports_reporter_required check (
    reporter_id is not null or reporter_key is not null
  )
);

create unique index reports_post_reporter_user_unique
  on public.reports (post_id, reporter_id)
  where reporter_id is not null;

create unique index reports_post_reporter_key_unique
  on public.reports (post_id, reporter_key)
  where reporter_key is not null;

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

create policy "posts_insert_anonymous" on public.posts
  for insert with check (user_id is null);

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

create policy "likes_insert_anonymous" on public.likes
  for insert with check (user_id is null);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- comments: 編集は本人。削除は本人または admin。
create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_insert_anonymous" on public.comments
  for insert with check (user_id is null);

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

create policy "reports_insert_anonymous" on public.reports
  for insert with check (
    reporter_id is null
    and reporter_key is not null
    and auth.uid() is null
  );

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
  ('youtube',     'YouTube',        'Video',            1,  true),
  ('books',       '本',              'BookOpen',         2,  true),
  ('manga',       '漫画',            'BookMarked',       3,  true),
  ('movies',      '映画',            'Film',             4,  true),
  ('anime',       'アニメ',          'Sparkles',         5,  true),
  ('drama',       'ドラマ',          'Tv',               6,  true),
  ('music',       '音楽',            'Music',            7,  true),
  ('games',       'ゲーム',          'Gamepad2',         8,  true),
  ('radio',       'ラジオ',          'Radio',            9,  true),
  ('apps',        'アプリ',          'Cpu',              10, true),
  ('food',        'メシ',            'UtensilsCrossed',  11, true),
  ('gadgets',     'ガジェット',      'Lightbulb',        12, true),
  ('spots',       '場所',            'MapPin',           13, true),
  ('photo',       '写真',            'Camera',           14, true),
  ('fashion',     '服',              'Shirt',            15, true),
  ('streaming',   '配信',            'Cast',             16, true),
  ('theater',     '舞台',            'Drama',            17, true),
  ('doujin',      '同人',            'PenTool',          18, true),
  ('occult',      'オカルト',        'Ghost',            19, true),
  ('creatures',   '生き物',          'PawPrint',         20, true),
  ('culture',     '文化',            'Landmark',         21, true),
  ('academia',    '学問',            'GraduationCap',    22, true),
  ('region',      '地域',            'MapPinned',        23, true),
  ('art',         '芸術',            'Palette',          24, true),
  ('other',       'その他',          'MoreHorizontal',   25, true);

insert into public.sub_categories (id, major_category_id, name, sort_order, is_active) values
  ('yt-education',       'youtube', '解説・教育',       1, true),
  ('yt-vlog',            'youtube', 'Vlog',             2, true),
  ('yt-gaming',          'youtube', 'ゲーム実況',       3, true),
  ('yt-cooking',         'youtube', '料理',             4, true),
  ('yt-entertainment',   'youtube', 'エンタメ',         5, true),
  ('yt-music',           'youtube', '音楽',             6, true),
  ('yt-science',         'youtube', '科学',             7, true),
  ('yt-review',          'youtube', 'レビュー',         8, true),
  ('yt-doc',             'youtube', 'ドキュメンタリー', 9, true),
  ('yt-asmr',            'youtube', 'ASMR',            10, true),
  ('yt-clip',            'youtube', '切り抜き',        11, true),
  ('yt-live',            'youtube', 'ライブ',          12, true),
  ('yt-news',            'youtube', 'ニュース',        13, true),
  ('yt-tech',            'youtube', 'テクノロジー',    14, true),
  ('yt-travel',          'youtube', '旅行',            15, true),
  ('yt-beauty',          'youtube', '美容',            16, true),
  ('yt-fitness',         'youtube', '筋トレ',          17, true),
  ('yt-history',         'youtube', '歴史',            18, true),
  ('yt-language',        'youtube', '語学',            19, true),
  ('yt-diy',             'youtube', 'DIY',             20, true),
  ('yt-unbox',           'youtube', '開封',            21, true),
  ('yt-reaction',        'youtube', 'リアクション',    22, true),
  ('yt-radio',           'youtube', 'ラジオ風',        23, true),
  ('yt-kids',            'youtube', '子供向け',        24, true),
  ('yt-animal',          'youtube', '動物',            25, true),
  ('yt-politics',        'youtube', '時事',            26, true),
  ('books-novel',        'books',   '小説',             1, true),
  ('books-nonfiction',   'books',   'ノンフィクション', 2, true),
  ('books-business',     'books',   'ビジネス書',       3, true),
  ('books-manga',        'books',   '漫画',             4, true),
  ('books-light-novel',  'books',   'ライトノベル',     5, true),
  ('books-essay',        'books',   'エッセイ',         6, true),
  ('books-poetry',       'books',   '詩',               7, true),
  ('books-academic',     'books',   '学術書',           8, true),
  ('books-children',     'books',   '児童書',           9, true),
  ('books-practical',    'books',   '実用書',          10, true),
  ('books-classic',      'books',   '古典',            11, true),
  ('books-criticism',    'books',   '評論',            12, true),
  ('books-sf',           'books',   'SF',              13, true),
  ('books-mystery',      'books',   'ミステリ',        14, true),
  ('books-horror',       'books',   'ホラー',          15, true),
  ('books-history',      'books',   '歴史',            16, true),
  ('books-science',      'books',   '科学',            17, true),
  ('books-philosophy',   'books',   '哲学',            18, true),
  ('books-selfhelp',     'books',   '自己啓発',        19, true),
  ('books-travel',       'books',   '紀行',            20, true),
  ('books-photo',        'books',   '写真集',          21, true),
  ('books-art',          'books',   '美術',            22, true),
  ('books-translation',  'books',   '翻訳',            23, true),
  ('books-zine',         'books',   'リトルプレス',    24, true),
  ('manga-shonen',       'manga',   '少年',             1, true),
  ('manga-shojo',        'manga',   '少女',             2, true),
  ('manga-seinen',       'manga',   '青年',             3, true),
  ('manga-josei',        'manga',   '女性',             4, true),
  ('manga-web',          'manga',   'Web漫画',          5, true),
  ('manga-gag',          'manga',   'ギャグ',           6, true),
  ('manga-horror',       'manga',   'ホラー',           7, true),
  ('manga-gourmet',      'manga',   'グルメ',           8, true),
  ('manga-sports',       'manga',   'スポーツ',         9, true),
  ('manga-history',      'manga',   '歴史',            10, true),
  ('manga-sf',           'manga',   'SF',              11, true),
  ('manga-mystery',      'manga',   'ミステリ',        12, true),
  ('manga-romance',      'manga',   '恋愛',            13, true),
  ('manga-isekai',       'manga',   '異世界',          14, true),
  ('manga-slice',        'manga',   '日常',            15, true),
  ('manga-mecha',        'manga',   'ロボット',        16, true),
  ('manga-bl',           'manga',   'BL',              17, true),
  ('manga-essay',        'manga',   'エッセイ漫画',    18, true),
  ('manga-yonkoma',      'manga',   '4コマ',           19, true),
  ('manga-indie',        'manga',   'インディー漫画',  20, true),
  ('movies-action',      'movies',  'アクション',       1, true),
  ('movies-sf',          'movies',  'SF',               2, true),
  ('movies-drama',       'movies',  'ドラマ',           3, true),
  ('movies-anime',       'movies',  'アニメ映画',       4, true),
  ('movies-documentary', 'movies',  'ドキュメンタリー', 5, true),
  ('movies-comedy',      'movies',  'コメディ',         6, true),
  ('movies-horror',      'movies',  'ホラー',           7, true),
  ('movies-romance',     'movies',  '恋愛',             8, true),
  ('movies-suspense',    'movies',  'サスペンス',       9, true),
  ('movies-japan',       'movies',  '日本映画',        10, true),
  ('movies-world',       'movies',  '外国映画',        11, true),
  ('movies-indie',       'movies',  'インディー',      12, true),
  ('movies-thriller',    'movies',  'スリラー',        13, true),
  ('movies-war',         'movies',  '戦争',            14, true),
  ('movies-musical',     'movies',  'ミュージカル',    15, true),
  ('movies-western',     'movies',  '西部劇',          16, true),
  ('movies-period',      'movies',  '時代劇',          17, true),
  ('movies-sports',      'movies',  'スポーツ',        18, true),
  ('movies-family',      'movies',  '家族',            19, true),
  ('movies-silent',      'movies',  '無声',            20, true),
  ('movies-short',       'movies',  '短編',            21, true),
  ('movies-experimental','movies',  '実験映画',        22, true),
  ('anime-tv',           'anime',   'TV',               1, true),
  ('anime-movie',        'anime',   '劇場',             2, true),
  ('anime-ova',          'anime',   'OVA',              3, true),
  ('anime-late',         'anime',   '深夜',             4, true),
  ('anime-kids',         'anime',   '子供向け',         5, true),
  ('anime-mecha',        'anime',   'ロボット',         6, true),
  ('anime-slice',        'anime',   '日常',             7, true),
  ('anime-isekai',       'anime',   '異世界',           8, true),
  ('anime-music',        'anime',   '音楽',             9, true),
  ('anime-sports',       'anime',   'スポーツ',        10, true),
  ('anime-sf',           'anime',   'SF',              11, true),
  ('anime-horror',       'anime',   'ホラー',          12, true),
  ('anime-romance',      'anime',   '恋愛',            13, true),
  ('anime-gag',          'anime',   'ギャグ',          14, true),
  ('anime-shonen',       'anime',   '少年',            15, true),
  ('anime-seinen',       'anime',   '青年',            16, true),
  ('anime-shojo',        'anime',   '少女',            17, true),
  ('anime-original',     'anime',   'オリジナル',      18, true),
  ('anime-adapt',        'anime',   '原作もの',        19, true),
  ('anime-short',        'anime',   '短編',            20, true),
  ('drama-jp',           'drama',   '国内',             1, true),
  ('drama-world',        'drama',   '海外',             2, true),
  ('drama-stream',       'drama',   '配信オリジナル',   3, true),
  ('drama-asadora',      'drama',   '朝ドラ',           4, true),
  ('drama-police',       'drama',   '刑事',             5, true),
  ('drama-medical',      'drama',   '医療',             6, true),
  ('drama-jidai',        'drama',   '時代劇',           7, true),
  ('drama-romance',      'drama',   '恋愛',             8, true),
  ('drama-family',       'drama',   '家族',             9, true),
  ('drama-school',       'drama',   '学園',            10, true),
  ('drama-work',         'drama',   '職場',            11, true),
  ('drama-comedy',       'drama',   'コメディ',        12, true),
  ('drama-mystery',      'drama',   'ミステリ',        13, true),
  ('drama-sf',           'drama',   'SF',              14, true),
  ('drama-doc',          'drama',   'ドキュメンタリードラマ', 15, true),
  ('drama-tokusatsu',    'drama',   '特撮',            16, true),
  ('drama-miniseries',   'drama',   '連続短編',        17, true),
  ('drama-stage',        'drama',   '舞台中継',        18, true),
  ('music-jpop',         'music',   'J-POP',            1, true),
  ('music-rock',         'music',   'ロック',           2, true),
  ('music-classical',    'music',   'クラシック',       3, true),
  ('music-jazz',         'music',   'ジャズ',           4, true),
  ('music-anime',        'music',   'アニソン',         5, true),
  ('music-hiphop',       'music',   'ヒップホップ',     6, true),
  ('music-electro',      'music',   'エレクトロ',       7, true),
  ('music-folk',         'music',   'フォーク',         8, true),
  ('music-metal',        'music',   'メタル',           9, true),
  ('music-idol',         'music',   'アイドル',        10, true),
  ('music-soundtrack',   'music',   'サントラ',        11, true),
  ('music-world',        'music',   'ワールド',        12, true),
  ('music-citypop',      'music',   'シティポップ',    13, true),
  ('music-punk',         'music',   'パンク',          14, true),
  ('music-ambient',      'music',   'アンビエント',    15, true),
  ('music-enka',         'music',   '演歌',            16, true),
  ('music-kpop',         'music',   'K-POP',           17, true),
  ('music-vocaloid',     'music',   'ボカロ',          18, true),
  ('music-choir',        'music',   '合唱',            19, true),
  ('music-game',         'music',   'ゲーム音楽',      20, true),
  ('music-experimental', 'music',   '実験音楽',        21, true),
  ('music-blues',        'music',   'ブルース',        22, true),
  ('music-reggae',       'music',   'レゲエ',          23, true),
  ('music-latin',        'music',   'ラテン',          24, true),
  ('games-rpg',          'games',   'RPG',              1, true),
  ('games-action',       'games',   'アクション',       2, true),
  ('games-indie',        'games',   'インディー',       3, true),
  ('games-board',        'games',   'ボードゲーム',     4, true),
  ('games-fps',          'games',   'FPS',              5, true),
  ('games-sim',          'games',   'シミュレーション', 6, true),
  ('games-puzzle',       'games',   'パズル',           7, true),
  ('games-rhythm',       'games',   '音ゲー',           8, true),
  ('games-social',       'games',   'ソシャゲ',         9, true),
  ('games-retro',        'games',   'レトロ',          10, true),
  ('games-fight',        'games',   '対戦',            11, true),
  ('games-adventure',    'games',   'アドベンチャー',  12, true),
  ('games-strategy',     'games',   'ストラテジー',    13, true),
  ('games-horror',       'games',   'ホラー',          14, true),
  ('games-sports',       'games',   'スポーツ',        15, true),
  ('games-racing',       'games',   'レース',          16, true),
  ('games-roguelike',    'games',   'ローグライク',    17, true),
  ('games-mmo',          'games',   'MMO',             18, true),
  ('games-card',         'games',   'カードゲーム',    19, true),
  ('games-vr',           'games',   'VR',              20, true),
  ('games-mobile',       'games',   'モバイル',        21, true),
  ('games-visual',       'games',   'ノベル',          22, true),
  ('radio-late',         'radio',   '深夜',             1, true),
  ('radio-local',        'radio',   'ローカル',         2, true),
  ('radio-net',          'radio',   'ネットラジオ',     3, true),
  ('radio-talk',         'radio',   'トーク',           4, true),
  ('radio-music',        'radio',   '音楽番組',         5, true),
  ('radio-news',         'radio',   'ニュース',         6, true),
  ('radio-reading',      'radio',   '朗読',             7, true),
  ('radio-sports',       'radio',   'スポーツ',         8, true),
  ('radio-culture',      'radio',   '文化',             9, true),
  ('radio-callin',       'radio',   'リスナー参加',    10, true),
  ('radio-community',    'radio',   'コミュニティFM',  11, true),
  ('radio-overseas',     'radio',   '海外ラジオ',      12, true),
  ('radio-archive',      'radio',   'アーカイブ',      13, true),
  ('radio-asmr',         'radio',   '声・ASMR',        14, true),
  ('radio-kids',         'radio',   '子供向け',        15, true),
  ('apps-prod',          'apps',    '生産性',           1, true),
  ('apps-sns',           'apps',    'SNS',              2, true),
  ('apps-create',        'apps',    '創作',             3, true),
  ('apps-learn',         'apps',    '学習',             4, true),
  ('apps-health',        'apps',    '健康',             5, true),
  ('apps-utility',       'apps',    '便利ツール',       6, true),
  ('apps-extension',     'apps',    '拡張機能',         7, true),
  ('apps-oss',           'apps',    'オープンソース',   8, true),
  ('apps-note',          'apps',    'メモ',             9, true),
  ('apps-calendar',      'apps',    'カレンダー',      10, true),
  ('apps-finance',       'apps',    '家計',            11, true),
  ('apps-map',           'apps',    '地図',            12, true),
  ('apps-photo',         'apps',    '写真編集',        13, true),
  ('apps-music',         'apps',    '音楽アプリ',      14, true),
  ('apps-browser',       'apps',    'ブラウザ',        15, true),
  ('apps-ai',            'apps',    'AI',              16, true),
  ('apps-privacy',       'apps',    'プライバシー',    17, true),
  ('apps-game',          'apps',    'ゲームアプリ',    18, true),
  ('food-washoku',       'food',    '和食',             1, true),
  ('food-chinese',       'food',    '中華',             2, true),
  ('food-western',       'food',    '洋食',             3, true),
  ('food-noodles',       'food',    '麺',               4, true),
  ('food-bread',         'food',    'パン',             5, true),
  ('food-sweets',        'food',    'スイーツ',         6, true),
  ('food-drink',         'food',    '酒',               7, true),
  ('food-cafe',          'food',    'カフェ',           8, true),
  ('food-home',          'food',    '自炊',             9, true),
  ('food-bgrade',        'food',    'B級',             10, true),
  ('food-ramen',         'food',    'ラーメン',        11, true),
  ('food-sushi',         'food',    '寿司',            12, true),
  ('food-yakiniku',      'food',    '焼肉',            13, true),
  ('food-curry',         'food',    'カレー',          14, true),
  ('food-italian',       'food',    'イタリア',        15, true),
  ('food-korean',        'food',    '韓国',            16, true),
  ('food-street',        'food',    '屋台',            17, true),
  ('food-veg',           'food',    '野菜中心',        18, true),
  ('food-breakfast',     'food',    '朝食',            19, true),
  ('food-bento',         'food',    '弁当',            20, true),
  ('food-fermented',     'food',    '発酵',            21, true),
  ('food-regional',      'food',    'ご当地グルメ',    22, true),
  ('gadgets-phone',      'gadgets', 'スマホ',           1, true),
  ('gadgets-pc',         'gadgets', 'PC',               2, true),
  ('gadgets-audio',      'gadgets', '音響',             3, true),
  ('gadgets-camera',     'gadgets', 'カメラ周辺',       4, true),
  ('gadgets-kitchen',    'gadgets', 'キッチン家電',     5, true),
  ('gadgets-light',      'gadgets', '照明',             6, true),
  ('gadgets-wearable',   'gadgets', 'ウェアラブル',     7, true),
  ('gadgets-stationery', 'gadgets', '文房具ガジェット', 8, true),
  ('gadgets-tablet',     'gadgets', 'タブレット',       9, true),
  ('gadgets-watch',      'gadgets', '時計',            10, true),
  ('gadgets-desk',       'gadgets', 'デスク周り',      11, true),
  ('gadgets-battery',    'gadgets', '充電',            12, true),
  ('gadgets-cable',      'gadgets', 'ケーブル',        13, true),
  ('gadgets-input',      'gadgets', 'キーボード・マウス', 14, true),
  ('gadgets-storage',    'gadgets', '保存',            15, true),
  ('gadgets-network',    'gadgets', '通信',            16, true),
  ('gadgets-repair',     'gadgets', '修理',            17, true),
  ('gadgets-vintage',    'gadgets', 'レトロ家電',      18, true),
  ('spots-shop',         'spots',   '店',               1, true),
  ('spots-park',         'spots',   '公園',             2, true),
  ('spots-architecture', 'spots',   '建築',             3, true),
  ('spots-station',      'spots',   '駅',               4, true),
  ('spots-shrine',       'spots',   '寺社',             5, true),
  ('spots-museum',       'spots',   '博物館',           6, true),
  ('spots-night',        'spots',   '夜景',             7, true),
  ('spots-hidden',       'spots',   '穴場',             8, true),
  ('spots-onsen',        'spots',   '温泉',             9, true),
  ('spots-library',      'spots',   '図書館',          10, true),
  ('spots-cafe',         'spots',   'カフェ',          11, true),
  ('spots-bookstore',    'spots',   '本屋',            12, true),
  ('spots-sea',          'spots',   '海',              13, true),
  ('spots-mountain',     'spots',   '山',              14, true),
  ('spots-ruins',        'spots',   '廃墟',            15, true),
  ('spots-bridge',       'spots',   '橋',              16, true),
  ('spots-school',       'spots',   '学校',            17, true),
  ('spots-factory',      'spots',   '工場',            18, true),
  ('spots-road',         'spots',   '道路',            19, true),
  ('spots-interior',     'spots',   '店内',            20, true),
  ('spots-nightwalk',    'spots',   '夜道',            21, true),
  ('spots-rooftop',      'spots',   '屋上',            22, true),
  ('photo-snap',         'photo',   'スナップ',         1, true),
  ('photo-landscape',    'photo',   '風景',             2, true),
  ('photo-portrait',     'photo',   'ポートレート',     3, true),
  ('photo-record',       'photo',   '記録',             4, true),
  ('photo-film',         'photo',   'フィルム',         5, true),
  ('photo-street',       'photo',   '街撮り',           6, true),
  ('photo-nature',       'photo',   '自然',             7, true),
  ('photo-architecture', 'photo',   '建築写真',         8, true),
  ('photo-night',        'photo',   '夜',               9, true),
  ('photo-macro',        'photo',   '接写',            10, true),
  ('photo-bw',           'photo',   'モノクロ',        11, true),
  ('photo-analog',       'photo',   'アナログ',        12, true),
  ('photo-drone',        'photo',   '空撮',            13, true),
  ('photo-product',      'photo',   '物撮り',          14, true),
  ('photo-event',        'photo',   '行事',            15, true),
  ('photo-self',         'photo',   '自分',            16, true),
  ('photo-abandoned',    'photo',   '廃景',            17, true),
  ('photo-people',       'photo',   '群像',            18, true),
  ('fashion-wear',       'fashion', '服',               1, true),
  ('fashion-shoes',      'fashion', '靴',               2, true),
  ('fashion-vintage',    'fashion', '古着',             3, true),
  ('fashion-uniform',    'fashion', 'ユニフォーム',     4, true),
  ('fashion-accessory',  'fashion', 'アクセサリー',     5, true),
  ('fashion-bag',        'fashion', 'バッグ',           6, true),
  ('fashion-style',      'fashion', '着こなし',         7, true),
  ('fashion-workwear',   'fashion', '作業着',           8, true),
  ('fashion-street',     'fashion', 'ストリート',       9, true),
  ('fashion-mode',       'fashion', 'モード',          10, true),
  ('fashion-casual',     'fashion', 'カジュアル',      11, true),
  ('fashion-formal',     'fashion', 'フォーマル',      12, true),
  ('fashion-kimono',     'fashion', '和装',            13, true),
  ('fashion-cosplay',    'fashion', 'コスプレ',        14, true),
  ('fashion-kids',       'fashion', '子供服',          15, true),
  ('fashion-repair',     'fashion', '繕い',            16, true),
  ('fashion-brand',      'fashion', 'ブランド',        17, true),
  ('stream-chat',        'streaming','雑談',            1, true),
  ('stream-game',        'streaming','ゲーム配信',      2, true),
  ('stream-song',        'streaming','歌',              3, true),
  ('stream-vtuber',      'streaming','VTuber',          4, true),
  ('stream-work',        'streaming','作業配信',        5, true),
  ('stream-study',       'streaming','勉強配信',        6, true),
  ('stream-clip',        'streaming','切り抜き',        7, true),
  ('stream-music',       'streaming','音楽配信',        8, true),
  ('stream-talk',        'streaming','対談',            9, true),
  ('stream-asmr',        'streaming','ASMR配信',       10, true),
  ('stream-irl',         'streaming','散歩配信',       11, true),
  ('stream-collab',      'streaming','コラボ',         12, true),
  ('stream-archive',     'streaming','アーカイブ',     13, true),
  ('stream-radio',       'streaming','ラジオ配信',     14, true),
  ('stream-art',         'streaming','お絵描き',       15, true),
  ('th-play',            'theater', '演劇',             1, true),
  ('th-musical',         'theater', 'ミュージカル',     2, true),
  ('th-rakugo',          'theater', '落語',             3, true),
  ('th-manzai',          'theater', '漫才',             4, true),
  ('th-live',            'theater', 'ライブ',           5, true),
  ('th-classic',         'theater', '古典芸能',         6, true),
  ('th-small',           'theater', '小劇場',           7, true),
  ('th-kabuki',          'theater', '歌舞伎',           8, true),
  ('th-noh',             'theater', '能',               9, true),
  ('th-bunraku',         'theater', '文楽',            10, true),
  ('th-opera',           'theater', 'オペラ',          11, true),
  ('th-ballet',          'theater', 'バレエ',          12, true),
  ('th-comedy',          'theater', '喜劇',            13, true),
  ('th-reading',         'theater', '朗読劇',          14, true),
  ('th-street',          'theater', '路上',            15, true),
  ('th-improv',          'theater', '即興',            16, true),
  ('doujin-manga',       'doujin',  '漫画',             1, true),
  ('doujin-novel',       'doujin',  '小説',             2, true),
  ('doujin-music',       'doujin',  '音楽',             3, true),
  ('doujin-game',        'doujin',  'ゲーム',           4, true),
  ('doujin-illust',      'doujin',  'イラスト',         5, true),
  ('doujin-event',       'doujin',  '即売会',           6, true),
  ('doujin-fan',         'doujin',  '二次創作',         7, true),
  ('doujin-original',    'doujin',  'オリジナル',       8, true),
  ('doujin-cosplay',     'doujin',  'コスプレ',         9, true),
  ('doujin-goods',       'doujin',  'グッズ',          10, true),
  ('doujin-video',       'doujin',  '動画',            11, true),
  ('doujin-zine',        'doujin',  '冊子',            12, true),
  ('doujin-3d',          'doujin',  '3D',              13, true),
  ('doujin-voice',       'doujin',  '音声',            14, true),
  ('doujin-software',    'doujin',  'ソフト',          15, true),
  ('doujin-circle',      'doujin',  'サークル',        16, true),
  ('occult-ghost',       'occult',  '心霊',             1, true),
  ('occult-urban',       'occult',  '都市伝説',         2, true),
  ('occult-folk',        'occult',  '民俗',             3, true),
  ('occult-ufo',         'occult',  'UFO',              4, true),
  ('occult-fortune',     'occult',  '占い',             5, true),
  ('occult-kaidan',      'occult',  '怪談',             6, true),
  ('occult-book',        'occult',  'オカルト本',       7, true),
  ('occult-ritual',      'occult',  '儀式',             8, true),
  ('occult-cryptid',     'occult',  '未確認生物',       9, true),
  ('occult-psychic',     'occult',  '超能力',          10, true),
  ('occult-curse',       'occult',  '呪い',            11, true),
  ('occult-religion',    'occult',  '民間信仰',        12, true),
  ('occult-dream',       'occult',  '夢',              13, true),
  ('occult-haunted',     'occult',  '心霊スポット',    14, true),
  ('occult-conspiracy',  'occult',  '陰謀',            15, true),
  ('occult-magic',       'occult',  '魔術',            16, true),
  ('creature-dog',       'creatures','犬',              1, true),
  ('creature-cat',       'creatures','猫',              2, true),
  ('creature-bird',      'creatures','鳥',              3, true),
  ('creature-bug',       'creatures','虫',              4, true),
  ('creature-fish',      'creatures','魚',              5, true),
  ('creature-wild',      'creatures','野生',            6, true),
  ('creature-plant',     'creatures','植物観察',        7, true),
  ('creature-myth',      'creatures','架空の生き物',    8, true),
  ('creature-rabbit',    'creatures','うさぎ',          9, true),
  ('creature-hamster',   'creatures','小動物',         10, true),
  ('creature-reptile',   'creatures','爬虫類',         11, true),
  ('creature-amphibian', 'creatures','両生類',         12, true),
  ('creature-horse',     'creatures','馬',             13, true),
  ('creature-farm',      'creatures','家畜',           14, true),
  ('creature-zoo',       'creatures','動物園',         15, true),
  ('creature-sea',       'creatures','海の生き物',     16, true),
  ('creature-micro',     'creatures','微生物',         17, true),
  ('culture-festival',   'culture', '祭り',             1, true),
  ('culture-manner',     'culture', '作法',             2, true),
  ('culture-language',   'culture', '言語文化',         3, true),
  ('culture-sub',        'culture', 'サブカル',         4, true),
  ('culture-pop',        'culture', '大衆文化',         5, true),
  ('culture-tradition',  'culture', '伝統芸能',         6, true),
  ('culture-food',       'culture', '食文化',           7, true),
  ('culture-dress',      'culture', '衣服文化',         8, true),
  ('culture-folktale',   'culture', '民話',             9, true),
  ('culture-net',        'culture', 'ネット文化',      10, true),
  ('culture-world',      'culture', '海外文化',        11, true),
  ('culture-youth',      'culture', '若者文化',        12, true),
  ('culture-tea',        'culture', '茶',              13, true),
  ('culture-shodo',      'culture', '書道文化',        14, true),
  ('culture-season',     'culture', '歳時記',          15, true),
  ('culture-play',       'culture', '遊び',            16, true),
  ('culture-work',       'culture', '労働文化',        17, true),
  ('culture-school',     'culture', '学校文化',        18, true),
  ('culture-otaku',      'culture', 'オタク文化',      19, true),
  ('culture-street',     'culture', 'ストリート文化',  20, true),
  ('culture-ad',         'culture', '広告文化',        21, true),
  ('culture-memorial',   'culture', '記念・追悼',      22, true),
  ('acad-philosophy',    'academia','哲学',             1, true),
  ('acad-history',       'academia','歴史学',           2, true),
  ('acad-literature',    'academia','文学',             3, true),
  ('acad-linguistics',   'academia','言語学',           4, true),
  ('acad-sociology',     'academia','社会学',           5, true),
  ('acad-psychology',    'academia','心理学',           6, true),
  ('acad-physics',       'academia','物理学',           7, true),
  ('acad-biology',       'academia','生物学',           8, true),
  ('acad-engineering',   'academia','工学',             9, true),
  ('acad-medicine',      'academia','医学',            10, true),
  ('acad-law',           'academia','法学',            11, true),
  ('acad-economics',     'academia','経済学',          12, true),
  ('acad-math',          'academia','数学',            13, true),
  ('acad-education',     'academia','教育学',          14, true),
  ('acad-chemistry',     'academia','化学',            15, true),
  ('acad-astronomy',     'academia','天文学',          16, true),
  ('acad-geology',       'academia','地学',            17, true),
  ('acad-geography',     'academia','地理学',          18, true),
  ('acad-anthropology',  'academia','人類学',          19, true),
  ('acad-archaeology',   'academia','考古学',          20, true),
  ('acad-politics',      'academia','政治学',          21, true),
  ('acad-stats',         'academia','統計',            22, true),
  ('acad-info',          'academia','情報学',          23, true),
  ('acad-art-history',   'academia','美術史',          24, true),
  ('acad-musicology',    'academia','音楽学',          25, true),
  ('acad-theology',      'academia','宗教学',          26, true),
  ('region-local',       'region',  '地元',             1, true),
  ('region-rural',       'region',  '田舎',             2, true),
  ('region-city',        'region',  '大都市',           3, true),
  ('region-shotengai',   'region',  '商店街',           4, true),
  ('region-port',        'region',  '港町',             5, true),
  ('region-campus',      'region',  '学園都市',         6, true),
  ('region-tourist',     'region',  '観光地',           7, true),
  ('region-depop',       'region',  '過疎地',           8, true),
  ('region-abroad',      'region',  '海外の街',         9, true),
  ('region-dialect',     'region',  '方言',            10, true),
  ('region-gotouchi',    'region',  'ご当地',          11, true),
  ('region-housing',     'region',  '団地・住宅地',    12, true),
  ('region-hokkaido',    'region',  '北海道',          13, true),
  ('region-tohoku',      'region',  '東北',            14, true),
  ('region-kanto',       'region',  '関東',            15, true),
  ('region-chubu',       'region',  '中部',            16, true),
  ('region-kansai',      'region',  '関西',            17, true),
  ('region-chugoku',     'region',  '中国',            18, true),
  ('region-shikoku',     'region',  '四国',            19, true),
  ('region-kyushu',      'region',  '九州・沖縄',      20, true),
  ('region-station',     'region',  '駅前',            21, true),
  ('region-oldtown',     'region',  '旧市街',          22, true),
  ('region-newtown',     'region',  'ニュータウン',    23, true),
  ('region-island',      'region',  '離島',            24, true),
  ('art-painting',       'art',     '絵画',             1, true),
  ('art-sculpture',      'art',     '彫刻',             2, true),
  ('art-design',         'art',     'デザイン',         3, true),
  ('art-architecture',   'art',     '建築',             4, true),
  ('art-craft',          'art',     '工芸',             5, true),
  ('art-contemporary',   'art',     '現代美術',         6, true),
  ('art-illust',         'art',     'イラスト',         7, true),
  ('art-calligraphy',    'art',     '書',               8, true),
  ('art-install',        'art',     'インスタレーション', 9, true),
  ('art-photo',          'art',     '写真表現',        10, true),
  ('art-moving',         'art',     '映像芸術',        11, true),
  ('art-print',          'art',     '版画',            12, true),
  ('art-pottery',        'art',     '陶芸',            13, true),
  ('art-textile',        'art',     '染織',            14, true),
  ('art-glass',          'art',     'ガラス',          15, true),
  ('art-performance',    'art',     'パフォーマンス',  16, true),
  ('art-public',         'art',     'パブリックアート', 17, true),
  ('art-folk',           'art',     '民芸',            18, true),
  ('art-digital',        'art',     'デジタルアート',  19, true),
  ('art-manga',          'art',     'マンガ表現',      20, true),
  ('art-stage',          'art',     '舞台美術',        21, true),
  ('other-diary',        'other',   '日記',             1, true),
  ('other-mix',          'other',   '複合',             2, true),
  ('other-experiment',   'other',   '実験',             3, true),
  ('other-unclassified', 'other',   '未分類',           4, true),
  ('other-question',     'other',   '質問',             5, true),
  ('other-list',         'other',   'リスト',           6, true),
  ('other-howto',        'other',   'やり方',           7, true),
  ('other-memory',       'other',   '思い出',           8, true),
  ('other-cross',        'other',   '横断おすすめ',     9, true);

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
