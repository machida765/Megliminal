-- おすすめの理由は任意。空文字を許可する。
alter table public.posts drop constraint if exists posts_description_length;

alter table public.posts
  add constraint posts_description_length
    check (char_length(btrim(description)) <= 1000);
