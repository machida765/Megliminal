-- いったんログインなしの透明掲示板。
-- 匿名投稿・コメント・いいねは user_id を NULL にする。
-- ユーザー機能を戻すときは、下記の anonymous INSERT ポリシーを外し、
-- アプリ側の PUBLIC_BOARD を false にする。

alter table public.posts
  alter column user_id drop not null;

alter table public.comments
  alter column user_id drop not null;

alter table public.likes
  alter column user_id drop not null;

create or replace function public.enforce_post_frequency()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- 匿名投稿は週1制限の対象外（ログインユーザー機能を戻したあとに再適用する）。
  if new.user_id is null then
    new.created_at := now();
    return new;
  end if;

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

  new.created_at := now();
  return new;
end;
$$;

drop policy if exists "posts_insert_anonymous" on public.posts;
create policy "posts_insert_anonymous" on public.posts
  for insert with check (user_id is null);

drop policy if exists "comments_insert_anonymous" on public.comments;
create policy "comments_insert_anonymous" on public.comments
  for insert with check (user_id is null);

drop policy if exists "likes_insert_anonymous" on public.likes;
create policy "likes_insert_anonymous" on public.likes
  for insert with check (user_id is null);
