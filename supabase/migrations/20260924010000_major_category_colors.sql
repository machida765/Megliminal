-- 大ジャンルのカード背景色。未設定の既存ジャンルだけ既定色を入れる。

alter table public.major_categories
  add column if not exists color_from text,
  add column if not exists color_to text,
  add column if not exists color_accent text;

alter table public.major_categories
  drop constraint if exists major_categories_color_from_hex;
alter table public.major_categories
  add constraint major_categories_color_from_hex
  check (color_from is null or color_from ~ '^#[0-9A-Fa-f]{6}$');

alter table public.major_categories
  drop constraint if exists major_categories_color_to_hex;
alter table public.major_categories
  add constraint major_categories_color_to_hex
  check (color_to is null or color_to ~ '^#[0-9A-Fa-f]{6}$');

alter table public.major_categories
  drop constraint if exists major_categories_color_accent_hex;
alter table public.major_categories
  add constraint major_categories_color_accent_hex
  check (color_accent is null or color_accent ~ '^#[0-9A-Fa-f]{6}$');

update public.major_categories as category
set
  color_from = seed.color_from,
  color_to = seed.color_to,
  color_accent = seed.color_accent
from (values
  ('youtube',   '#ff6b6b', '#c0392b', '#b83232'),
  ('books',     '#d4a574', '#8b6914', '#8b5a2b'),
  ('manga',     '#e8a090', '#b45c4a', '#b45c4a'),
  ('movies',    '#9b8fd9', '#5c4d8a', '#5c4d8a'),
  ('anime',     '#f0a0c8', '#c45a96', '#c45a96'),
  ('drama',     '#b8a0d4', '#6e4e9a', '#6e4e9a'),
  ('music',     '#6ecfc9', '#2a7a7a', '#2a7a7a'),
  ('games',     '#7bc67e', '#3d7a4a', '#3d7a4a'),
  ('radio',     '#c8b070', '#7a6828', '#7a6828'),
  ('apps',      '#7eb0e8', '#3a6ea5', '#3a6ea5'),
  ('food',      '#f0b07a', '#c4763a', '#c4763a'),
  ('gadgets',   '#a8b4c4', '#5a6578', '#5a6578'),
  ('spots',     '#6ecfaa', '#2d8a6e', '#2d8a6e'),
  ('photo',     '#8aa8c8', '#3d5a78', '#3d5a78'),
  ('fashion',   '#d4a0b8', '#9a5a78', '#9a5a78'),
  ('streaming', '#c080d0', '#7a4090', '#7a4090'),
  ('theater',   '#d090a0', '#8a4058', '#8a4058'),
  ('doujin',    '#d4a070', '#8a5830', '#8a5830'),
  ('occult',    '#8a7aa8', '#4a3d68', '#4a3d68'),
  ('creatures', '#a8c478', '#5a7a38', '#5a7a38'),
  ('culture',   '#d4b878', '#8a6a28', '#8a6a28'),
  ('academia',  '#8ab0d4', '#3d6288', '#3d6288'),
  ('region',    '#7cbc78', '#3a7a40', '#3a7a40'),
  ('art',       '#e0a070', '#a05a30', '#a05a30'),
  ('other',     '#c4b8aa', '#7a746c', '#7a746c')
) as seed(id, color_from, color_to, color_accent)
where category.id = seed.id
  and category.color_from is null;
