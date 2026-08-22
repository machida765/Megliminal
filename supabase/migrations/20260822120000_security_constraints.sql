-- 入力制約と投稿頻度を DB 側でも強制する。
-- NOT VALID 制約も追加後の INSERT / UPDATE には適用される。

alter table public.profiles
  add constraint profiles_name_length
    check (char_length(btrim(name)) between 1 and 50) not valid,
  add constraint profiles_avatar_url_safe
    check (
      avatar_url is null
      or (
        char_length(avatar_url) <= 2048
        and avatar_url !~ '[[:cntrl:]]'
        and (
          avatar_url = '👤'
          or (
            avatar_url like '/%'
            and avatar_url not like '//%'
            and position('\' in avatar_url) = 0
            and position('..' in avatar_url) = 0
          )
          or avatar_url ~* '^https?://'
        )
      )
    ) not valid;

alter table public.posts
  add constraint posts_title_length
    check (char_length(btrim(title)) between 1 and 100) not valid,
  add constraint posts_description_length
    check (char_length(btrim(description)) between 1 and 1000) not valid,
  add constraint posts_url_safe
    check (
      url is null
      or (
        char_length(url) <= 2048
        and url !~ '[[:cntrl:]]'
        and url ~* '^https?://'
      )
    ) not valid;

create or replace function public.enforce_post_frequency()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- 同一ユーザー・大カテゴリの同時投稿も直列化する。
  perform pg_advisory_xact_lock(
    hashtextextended(new.user_id::text || ':' || new.major_category_id, 0)
  );

  if exists (
    select 1
    from public.posts
    where user_id = new.user_id
      and major_category_id = new.major_category_id
      and created_at > now() - interval '7 days'
  ) then
    raise exception '同じ大カテゴリへの投稿は7日間に1回までです。'
      using errcode = '23514';
  end if;

  -- API から過去日時を指定して頻度制限を回避できないよう固定する。
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists posts_enforce_frequency on public.posts;
create trigger posts_enforce_frequency
  before insert on public.posts
  for each row execute function public.enforce_post_frequency();
