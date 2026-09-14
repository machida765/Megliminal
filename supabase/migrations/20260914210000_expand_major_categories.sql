-- 大ジャンルをとがった30種に揃える
insert into public.major_categories (id, name, icon, sort_order, is_active) values
  ('youtube',     'YouTube',        'Video',            1,  true),
  ('books',       '本',              'BookOpen',         2,  true),
  ('manga',       '漫画',            'BookMarked',       3,  true),
  ('movies',      '映画',            'Film',             4,  true),
  ('anime',       'アニメ',          'Sparkles',         5,  true),
  ('drama',       'ドラマ',          'Tv',               6,  true),
  ('music',       '音楽',            'Music',            7,  true),
  ('games',       'ゲーム',          'Gamepad2',         8,  true),
  ('podcast',     'ポッドキャスト',  'Headphones',       9,  true),
  ('radio',       'ラジオ',          'Radio',            10, true),
  ('apps',        'アプリ',          'Cpu',              11, true),
  ('food',        'メシ',            'UtensilsCrossed',  12, true),
  ('gadgets',     'ガジェット',      'Lightbulb',        13, true),
  ('spots',       '場所',            'MapPin',           14, true),
  ('photo',       '写真',            'Camera',           15, true),
  ('fashion',     '服',              'Shirt',            16, true),
  ('streaming',   '配信',            'Cast',             17, true),
  ('theater',     '舞台',            'Drama',            18, true),
  ('doujin',      '同人',            'PenTool',          19, true),
  ('indie',       'インディー',      'Feather',          20, true),
  ('liminal',     'リミナル',        'DoorOpen',         21, true),
  ('occult',      'オカルト',        'Ghost',            22, true),
  ('netruins',    'ネットの遺物',    'ScanLine',         23, true),
  ('collections', '蒐集',            'Gem',              24, true),
  ('creatures',   '生き物',          'PawPrint',         25, true),
  ('art',         '絵',              'Palette',          26, true),
  ('idols',       '推し',            'Star',             27, true),
  ('living',      '部屋',            'Home',             28, true),
  ('travel',      '旅',              'Plane',            29, true),
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
  'podcast', 'radio', 'apps', 'food', 'gadgets', 'spots', 'photo', 'fashion',
  'streaming', 'theater', 'doujin', 'indie', 'liminal', 'occult', 'netruins',
  'collections', 'creatures', 'art', 'idols', 'living', 'travel', 'other'
);
