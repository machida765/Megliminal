-- 匿名通報は投稿・いいねと同じく auth.uid() を問わない。
-- （セッション Cookie が残っていると uid 付きになり、従来ポリシーで 401 になる）
drop policy if exists "reports_insert_anonymous" on public.reports;
create policy "reports_insert_anonymous" on public.reports
  for insert with check (
    reporter_id is null
    and reporter_key is not null
  );

grant select, insert on table public.reports to anon, authenticated;
