-- いったん週1制限はオフ。投稿日時の固定だけ残す。
-- 戻すときは 20260914100000_public_board.sql の enforce_post_frequency を再適用する。
create or replace function public.enforce_post_frequency()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- if new.user_id is not null then
  --   perform pg_advisory_xact_lock(
  --     hashtextextended(new.user_id::text || ':' || new.major_category_id, 0)
  --   );
  --
  --   if exists (
  --     select 1
  --     from public.posts
  --     where user_id = new.user_id
  --       and major_category_id = new.major_category_id
  --       and created_at > now() - interval '7 days'
  --   ) then
  --     raise exception '同じ大カテゴリへの投稿は7日間に1回までです。'
  --       using errcode = '23514';
  --   end if;
  -- end if;

  new.created_at := now();
  return new;
end;
$$;
