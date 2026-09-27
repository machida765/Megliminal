-- 投稿の削除は管理者だけ。本人削除のポリシーを外す。
drop policy if exists "posts_delete_own" on public.posts;
