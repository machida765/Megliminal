-- 概念寄りの大ジャンルに差し替え
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
  ('routine',     'ルーティン',      'Repeat',           21, true),
  ('mood',        '雰囲気',          'CloudSun',         22, true),
  ('night',       '夜',              'Moon',             23, true),
  ('background',  'ながら',          'Layers',           24, true),
  ('nostalgia',   'なつかしさ',      'Hourglass',        25, true),
  ('ritual',      '儀式',            'Flame',            26, true),
  ('transit',     '移動中',          'TrainFront',       27, true),
  ('idle',        '暇',              'Coffee',           28, true),
  ('rediscovery', '再発見',          'Search',           29, true),
  ('other',       'その他',          'MoreHorizontal',   30, true)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

update public.major_categories
set is_active = false
where id not in (
  'youtube', 'books', 'manga', 'movies', 'anime', 'drama', 'music', 'games',
  'radio', 'apps', 'food', 'gadgets', 'spots', 'photo', 'fashion',
  'streaming', 'theater', 'doujin', 'occult', 'creatures',
  'routine', 'mood', 'night', 'background', 'nostalgia', 'ritual',
  'transit', 'idle', 'rediscovery', 'other'
);
