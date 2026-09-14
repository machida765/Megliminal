-- 掲示板モード向け: ログインなし通報（reporter_key）と管理者向け一覧

alter table public.reports
  alter column reporter_id drop not null;

alter table public.reports
  add column if not exists reporter_key text;

alter table public.reports
  drop constraint if exists reports_post_id_reporter_id_key;

alter table public.reports
  drop constraint if exists reports_reporter_required;

alter table public.reports
  add constraint reports_reporter_required check (
    reporter_id is not null or reporter_key is not null
  );

create unique index if not exists reports_post_reporter_user_unique
  on public.reports (post_id, reporter_id)
  where reporter_id is not null;

create unique index if not exists reports_post_reporter_key_unique
  on public.reports (post_id, reporter_key)
  where reporter_key is not null;

drop policy if exists "reports_insert_anonymous" on public.reports;
create policy "reports_insert_anonymous" on public.reports
  for insert with check (
    reporter_id is null
    and reporter_key is not null
    and auth.uid() is null
  );
