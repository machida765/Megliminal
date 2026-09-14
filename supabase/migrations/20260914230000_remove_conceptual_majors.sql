-- 直前に足した概念ジャンルを非表示にする
update public.major_categories
set is_active = false
where id in (
  'routine',
  'mood',
  'night',
  'background',
  'nostalgia',
  'ritual',
  'transit',
  'idle',
  'rediscovery'
);

update public.major_categories
set sort_order = 21
where id = 'other';
