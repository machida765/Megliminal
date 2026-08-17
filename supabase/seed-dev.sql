-- =============================================================================
-- メグリミナル 開発環境用シードデータ
-- =============================================================================
-- 対象: Supabase SQL Editor（本番 DB では実行しないこと）
-- 由来: data/dummy.ts と同内容（投稿 6 件・ユーザー 4 名）
--
-- 開発データの目印:
--   - メール: dev-seed-XXX@megliminal.dev
--   - 表示名: [DEV] ...
--   - 投稿タイトル: [DEV] ...
--   - UUID: 11111111-...（ユーザー）/ 22222222-...（投稿）
--
-- 前提: schema.sql を先に実行済みであること
-- 再実行: 下記「削除」ブロックのコメントを外してから実行
-- =============================================================================

-- ─────────────────────────────────────────
-- 削除（再投入時のみコメント解除）
-- ─────────────────────────────────────────
/*
delete from public.likes
where post_id in (
  '22222222-2222-4222-a222-222222220001',
  '22222222-2222-4222-a222-222222220002',
  '22222222-2222-4222-a222-222222220003',
  '22222222-2222-4222-a222-222222220004',
  '22222222-2222-4222-a222-222222220005',
  '22222222-2222-4222-a222-222222220006'
);

delete from public.post_tags
where post_id in (
  '22222222-2222-4222-a222-222222220001',
  '22222222-2222-4222-a222-222222220002',
  '22222222-2222-4222-a222-222222220003',
  '22222222-2222-4222-a222-222222220004',
  '22222222-2222-4222-a222-222222220005',
  '22222222-2222-4222-a222-222222220006'
);

delete from public.posts
where id in (
  '22222222-2222-4222-a222-222222220001',
  '22222222-2222-4222-a222-222222220002',
  '22222222-2222-4222-a222-222222220003',
  '22222222-2222-4222-a222-222222220004',
  '22222222-2222-4222-a222-222222220005',
  '22222222-2222-4222-a222-222222220006'
);

delete from public.profiles
where id in (
  '11111111-1111-4111-a111-111111110001',
  '11111111-1111-4111-a111-111111110002',
  '11111111-1111-4111-a111-111111110003',
  '11111111-1111-4111-a111-111111110004'
);

delete from auth.identities
where user_id in (
  '11111111-1111-4111-a111-111111110001',
  '11111111-1111-4111-a111-111111110002',
  '11111111-1111-4111-a111-111111110003',
  '11111111-1111-4111-a111-111111110004'
);

delete from auth.users
where id in (
  '11111111-1111-4111-a111-111111110001',
  '11111111-1111-4111-a111-111111110002',
  '11111111-1111-4111-a111-111111110003',
  '11111111-1111-4111-a111-111111110004'
);
*/

-- ─────────────────────────────────────────
-- 開発用ユーザー（auth.users → profiles はトリガーで自動作成）
-- ログインする場合の共通パスワード: dev-seed-password
-- ─────────────────────────────────────────
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-a111-111111110001',
    'authenticated',
    'authenticated',
    'dev-seed-001@megliminal.dev',
    crypt('dev-seed-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"[DEV] Taro Yamada","avatar_url":"👨‍💻"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-a111-111111110002',
    'authenticated',
    'authenticated',
    'dev-seed-002@megliminal.dev',
    crypt('dev-seed-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"[DEV] Hanako Suzuki","avatar_url":"👩‍🎨"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-a111-111111110003',
    'authenticated',
    'authenticated',
    'dev-seed-003@megliminal.dev',
    crypt('dev-seed-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"[DEV] Jiro Tanaka","avatar_url":"🎬"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-a111-111111110004',
    'authenticated',
    'authenticated',
    'dev-seed-004@megliminal.dev',
    crypt('dev-seed-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"[DEV] Yuki Nakamura","avatar_url":"📚"}',
    now(),
    now(),
    '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-a111-111111110001',
    '11111111-1111-4111-a111-111111110001',
    'dev-seed-001@megliminal.dev',
    jsonb_build_object(
      'sub', '11111111-1111-4111-a111-111111110001',
      'email', 'dev-seed-001@megliminal.dev'
    ),
    'email',
    now(), now(), now()
  ),
  (
    '11111111-1111-4111-a111-111111110002',
    '11111111-1111-4111-a111-111111110002',
    'dev-seed-002@megliminal.dev',
    jsonb_build_object(
      'sub', '11111111-1111-4111-a111-111111110002',
      'email', 'dev-seed-002@megliminal.dev'
    ),
    'email',
    now(), now(), now()
  ),
  (
    '11111111-1111-4111-a111-111111110003',
    '11111111-1111-4111-a111-111111110003',
    'dev-seed-003@megliminal.dev',
    jsonb_build_object(
      'sub', '11111111-1111-4111-a111-111111110003',
      'email', 'dev-seed-003@megliminal.dev'
    ),
    'email',
    now(), now(), now()
  ),
  (
    '11111111-1111-4111-a111-111111110004',
    '11111111-1111-4111-a111-111111110004',
    'dev-seed-004@megliminal.dev',
    jsonb_build_object(
      'sub', '11111111-1111-4111-a111-111111110004',
      'email', 'dev-seed-004@megliminal.dev'
    ),
    'email',
    now(), now(), now()
  )
on conflict (id) do nothing;

-- トリガー作成後に表示名を揃える（既存行は更新）
insert into public.profiles (id, name, avatar_url, role)
values
  ('11111111-1111-4111-a111-111111110001', '[DEV] Taro Yamada',   '👨‍💻', 'user'),
  ('11111111-1111-4111-a111-111111110002', '[DEV] Hanako Suzuki', '👩‍🎨', 'user'),
  ('11111111-1111-4111-a111-111111110003', '[DEV] Jiro Tanaka',   '🎬', 'user'),
  ('11111111-1111-4111-a111-111111110004', '[DEV] Yuki Nakamura', '📚', 'user')
on conflict (id) do update set
  name = excluded.name,
  avatar_url = excluded.avatar_url;

-- 管理画面テスト用（任意）: 001 を admin にする
-- update public.profiles set role = 'admin'
-- where id = '11111111-1111-4111-a111-111111110001';

-- ─────────────────────────────────────────
-- 開発用投稿（data/dummy.ts POSTS と同内容）
-- ─────────────────────────────────────────
insert into public.posts (
  id,
  user_id,
  major_category_id,
  sub_category_id,
  title,
  description,
  url,
  like_count,
  created_at
) values
  (
    '22222222-2222-4222-a222-222222220001',
    '11111111-1111-4111-a111-111111110001',
    'youtube',
    'yt-education',
    '[DEV] ゆる言語学ラジオ',
    '言語学をテーマにした解説チャンネル。「なぜこの言葉はこう聞こえるのか」という疑問を丁寧に解きほぐしていく構成が秀逸。話し手2人のテンポが心地よく、ながら聴きにも最適です。',
    'https://www.youtube.com/@yurugengo',
    0,
    now() - interval '1 day'
  ),
  (
    '22222222-2222-4222-a222-222222220002',
    '11111111-1111-4111-a111-111111110004',
    'books',
    'books-essay',
    '[DEV] 「火花」- 又吉直樹',
    'コメディアンの人生を通じた「生きることの意味」を問う傑作。笑いと切なさが交錯する世界観に引き込まれました。',
    'https://www.shinchosha.co.jp/',
    0,
    now() - interval '3 days'
  ),
  (
    '22222222-2222-4222-a222-222222220003',
    '11111111-1111-4111-a111-111111110003',
    'movies',
    'movies-sf',
    '[DEV] インセプション',
    '時間、現実、潜在意識のレイヤーが織り交ざった複雑なストーリー。何度観ても新しい発見があります。音響設計も完璧。',
    null,
    0,
    now() - interval '5 days'
  ),
  (
    '22222222-2222-4222-a222-222222220004',
    '11111111-1111-4111-a111-111111110001',
    'apps',
    null,
    '[DEV] Cursor（AIコードエディタ）',
    'VSCodeベースのAI統合エディタ。プロンプト一つでコード生成・リファクタリングが可能。開発速度が劇的に上がりました。',
    'https://www.cursor.com/',
    0,
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-a222-222222220005',
    '11111111-1111-4111-a111-111111110002',
    'youtube',
    'yt-cooking',
    '[DEV] 料理研究家リュウジのバズレシピ',
    '再現性が高く、材料も手に入りやすい。毎回「そんな手があったか」と唸らされます。特に時短シリーズは平日の救世主。',
    'https://www.youtube.com/@RyujiCooking',
    0,
    now() - interval '4 days'
  ),
  (
    '22222222-2222-4222-a222-222222220006',
    '11111111-1111-4111-a111-111111110002',
    'books',
    'books-novel',
    '[DEV] 「三体」- 劉慈欣',
    '中国発のSF大作。スケールが圧倒的で、物理法則すら武器にするアイデアに震えました。ページをめくる手が止まらない。',
    null,
    0,
    now() - interval '7 days'
  )
on conflict (id) do nothing;

-- タグ（dummy.ts と同じ組み合わせ）
insert into public.post_tags (post_id, tag_id) values
  ('22222222-2222-4222-a222-222222220001', 'tech'),
  ('22222222-2222-4222-a222-222222220001', 'education'),
  ('22222222-2222-4222-a222-222222220002', 'mystery'),
  ('22222222-2222-4222-a222-222222220002', 'anime'),
  ('22222222-2222-4222-a222-222222220003', 'sf'),
  ('22222222-2222-4222-a222-222222220003', 'documentary'),
  ('22222222-2222-4222-a222-222222220004', 'tech'),
  ('22222222-2222-4222-a222-222222220005', 'cooking'),
  ('22222222-2222-4222-a222-222222220005', 'vlog'),
  ('22222222-2222-4222-a222-222222220006', 'sf'),
  ('22222222-2222-4222-a222-222222220006', 'mystery')
on conflict do nothing;

-- いいね（1 投稿あたり最大 4 件 = ユニーク制約。ランキング確認用）
insert into public.likes (post_id, user_id, created_at)
select
  p.post_id,
  u.user_id,
  now() - (p.idx * interval '6 hours')
from (
  values
    ('22222222-2222-4222-a222-222222220001'::uuid, 1),
    ('22222222-2222-4222-a222-222222220001'::uuid, 2),
    ('22222222-2222-4222-a222-222222220001'::uuid, 3),
    ('22222222-2222-4222-a222-222222220002'::uuid, 1),
    ('22222222-2222-4222-a222-222222220002'::uuid, 2),
    ('22222222-2222-4222-a222-222222220003'::uuid, 1),
    ('22222222-2222-4222-a222-222222220003'::uuid, 2),
    ('22222222-2222-4222-a222-222222220003'::uuid, 3),
    ('22222222-2222-4222-a222-222222220003'::uuid, 4),
    ('22222222-2222-4222-a222-222222220004'::uuid, 1),
    ('22222222-2222-4222-a222-222222220004'::uuid, 2),
    ('22222222-2222-4222-a222-222222220004'::uuid, 3),
    ('22222222-2222-4222-a222-222222220004'::uuid, 4),
    ('22222222-2222-4222-a222-222222220005'::uuid, 1),
    ('22222222-2222-4222-a222-222222220005'::uuid, 2),
    ('22222222-2222-4222-a222-222222220006'::uuid, 1),
    ('22222222-2222-4222-a222-222222220006'::uuid, 2),
    ('22222222-2222-4222-a222-222222220006'::uuid, 3),
    ('22222222-2222-4222-a222-222222220006'::uuid, 4)
) as p(post_id, idx)
cross join lateral (
  select (array[
    '11111111-1111-4111-a111-111111110001'::uuid,
    '11111111-1111-4111-a111-111111110002'::uuid,
    '11111111-1111-4111-a111-111111110003'::uuid,
    '11111111-1111-4111-a111-111111110004'::uuid
  ])[p.idx] as user_id
) u
on conflict (post_id, user_id) do nothing;

-- 表示用 like_count を local ダミーと揃える（SQL Editor 実行時はトリガー保護を bypass）
update public.posts set like_count = 15
where id = '22222222-2222-4222-a222-222222220001';
update public.posts set like_count = 8
where id = '22222222-2222-4222-a222-222222220002';
update public.posts set like_count = 20
where id = '22222222-2222-4222-a222-222222220003';
update public.posts set like_count = 30
where id = '22222222-2222-4222-a222-222222220004';
update public.posts set like_count = 12
where id = '22222222-2222-4222-a222-222222220005';
update public.posts set like_count = 25
where id = '22222222-2222-4222-a222-222222220006';

-- 投入確認
select
  p.id,
  p.title,
  pr.name as author,
  p.like_count,
  p.created_at
from public.posts p
join public.profiles pr on pr.id = p.user_id
where p.title like '[DEV]%'
order by p.created_at desc;
