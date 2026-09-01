import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createAdminClient,
  createAnonClient,
  createPostAs,
  createTestUser,
  deleteTestUsers,
  getAnyMajorCategoryId,
  isSupabaseReachable,
  type TestUser,
} from './setup';

const reachable = await isSupabaseReachable();

describe.skipIf(!reachable)('RLS / 権限', () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  let alice: TestUser;
  let bob: TestUser;
  let moderator: TestUser;
  let majorCategoryId: string;
  let alicePostId: string;

  beforeAll(async () => {
    admin = createAdminClient();
    anon = createAnonClient();
    majorCategoryId = await getAnyMajorCategoryId(admin);
    alice = await createTestUser(admin, 'alice');
    bob = await createTestUser(admin, 'bob');
    moderator = await createTestUser(admin, 'mod', 'admin');
    alicePostId = await createPostAs(alice, majorCategoryId, 'アリスの投稿');
  }, 60_000);

  afterAll(async () => {
    if (!admin) return;
    await deleteTestUsers(admin, [alice?.id, bob?.id, moderator?.id].filter(Boolean) as string[]);
  }, 30_000);

  describe('posts', () => {
    it('未ログインでも投稿は読める', async () => {
      const { data, error } = await anon
        .from('posts')
        .select('id')
        .eq('id', alicePostId)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(alicePostId);
    });

    it('未ログインでは投稿できない', async () => {
      const { error } = await anon.from('posts').insert({
        user_id: alice.id,
        major_category_id: majorCategoryId,
        title: '匿名投稿',
        description: '匿名投稿の説明',
      });

      expect(error).not.toBeNull();
    });

    it('他人名義では投稿できない', async () => {
      const { error } = await bob.client.from('posts').insert({
        user_id: alice.id,
        major_category_id: majorCategoryId,
        title: 'なりすまし投稿',
        description: 'なりすまし投稿の説明',
      });

      expect(error).not.toBeNull();
    });

    it('他人の投稿は更新できない', async () => {
      const { data, error } = await bob.client
        .from('posts')
        .update({ title: '書き換え' })
        .eq('id', alicePostId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('他人の投稿は削除できない', async () => {
      const { data, error } = await bob.client
        .from('posts')
        .delete()
        .eq('id', alicePostId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);

      const { data: still } = await admin
        .from('posts')
        .select('id')
        .eq('id', alicePostId)
        .maybeSingle();
      expect(still?.id).toBe(alicePostId);
    });

    it('本人は自分の投稿を更新できる', async () => {
      const { data, error } = await alice.client
        .from('posts')
        .update({ title: 'アリスの投稿（更新）' })
        .eq('id', alicePostId)
        .select('title')
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe('アリスの投稿（更新）');
    });

    it('admin は他人の投稿を削除できる', async () => {
      const targetId = await createPostAs(alice, majorCategoryId, '削除される投稿');

      const { data, error } = await moderator.client
        .from('posts')
        .delete()
        .eq('id', targetId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe('profiles', () => {
    it('プロフィールは誰でも読める', async () => {
      const { data, error } = await anon
        .from('profiles')
        .select('id, name')
        .eq('id', alice.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(alice.id);
    });

    it('自分を admin に昇格できない', async () => {
      await bob.client.from('profiles').update({ role: 'admin' }).eq('id', bob.id);

      const { data } = await admin
        .from('profiles')
        .select('role')
        .eq('id', bob.id)
        .single();

      expect(data?.role).toBe('user');
    });

    it('他人のプロフィールは更新できない', async () => {
      const { data, error } = await bob.client
        .from('profiles')
        .update({ name: '乗っ取り' })
        .eq('id', alice.id)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('likes', () => {
    it('本人名義のいいねは付けられる', async () => {
      const { error } = await bob.client
        .from('likes')
        .insert({ post_id: alicePostId, user_id: bob.id });

      expect(error).toBeNull();
    });

    it('他人名義のいいねは付けられない', async () => {
      const { error } = await bob.client
        .from('likes')
        .insert({ post_id: alicePostId, user_id: alice.id });

      expect(error).not.toBeNull();
    });

    it('他人のいいねは解除できない', async () => {
      const { data, error } = await alice.client
        .from('likes')
        .delete()
        .eq('post_id', alicePostId)
        .eq('user_id', bob.id)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('いいねすると posts.like_count が増える', async () => {
      const { data } = await admin
        .from('posts')
        .select('like_count')
        .eq('id', alicePostId)
        .single();

      expect(data?.like_count).toBeGreaterThanOrEqual(1);
    });

    it('本人は自分のいいねを解除できる', async () => {
      const { data, error } = await bob.client
        .from('likes')
        .delete()
        .eq('post_id', alicePostId)
        .eq('user_id', bob.id)
        .select('id');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe('comments', () => {
    let bobCommentId: string;

    it('ログインすればコメントできる', async () => {
      const { data, error } = await bob.client
        .from('comments')
        .insert({ post_id: alicePostId, user_id: bob.id, body: 'ボブのコメント' })
        .select('id')
        .single();

      expect(error).toBeNull();
      bobCommentId = data!.id as string;
    });

    it('他人名義ではコメントできない', async () => {
      const { error } = await bob.client
        .from('comments')
        .insert({ post_id: alicePostId, user_id: alice.id, body: 'なりすまし' });

      expect(error).not.toBeNull();
    });

    it('他人のコメントは編集できない', async () => {
      const { data, error } = await alice.client
        .from('comments')
        .update({ body: '書き換え' })
        .eq('id', bobCommentId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('投稿者でも他人のコメントは削除できない', async () => {
      const { data, error } = await alice.client
        .from('comments')
        .delete()
        .eq('id', bobCommentId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('admin は他人のコメントを削除できる', async () => {
      const { data, error } = await moderator.client
        .from('comments')
        .delete()
        .eq('id', bobCommentId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe('bookmarks', () => {
    it('自分のブックマークは作成・取得できる', async () => {
      const { error } = await bob.client
        .from('bookmarks')
        .insert({ user_id: bob.id, post_id: alicePostId });
      expect(error).toBeNull();

      const { data } = await bob.client.from('bookmarks').select('post_id');
      expect(data?.map((r) => r.post_id)).toContain(alicePostId);
    });

    it('他人のブックマークは見えない', async () => {
      const { data, error } = await alice.client
        .from('bookmarks')
        .select('id')
        .eq('user_id', bob.id);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('他人名義では作成できない', async () => {
      const { error } = await alice.client
        .from('bookmarks')
        .insert({ user_id: bob.id, post_id: alicePostId });

      expect(error).not.toBeNull();
    });
  });

  describe('reports', () => {
    it('本人名義の通報は作成できる', async () => {
      const { error } = await bob.client.from('reports').insert({
        post_id: alicePostId,
        reporter_id: bob.id,
        reason: 'spam',
        detail: 'RLS テストの通報',
      });

      expect(error).toBeNull();
    });

    it('他人名義では通報できない', async () => {
      const { error } = await alice.client.from('reports').insert({
        post_id: alicePostId,
        reporter_id: bob.id,
        reason: 'spam',
      });

      expect(error).not.toBeNull();
    });

    it('通報された側は通報を読めない', async () => {
      const { data, error } = await alice.client
        .from('reports')
        .select('id')
        .eq('post_id', alicePostId);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('通報者は自分の通報を読める', async () => {
      const { data, error } = await bob.client
        .from('reports')
        .select('id')
        .eq('post_id', alicePostId);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(1);
    });

    it('admin は通報を一覧できる', async () => {
      const { data, error } = await moderator.client
        .from('reports')
        .select('id')
        .eq('post_id', alicePostId);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(1);
    });

    it('一般ユーザーは通報を解決できない', async () => {
      const { data, error } = await bob.client
        .from('reports')
        .update({ status: 'resolved' })
        .eq('post_id', alicePostId)
        .select('id');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('admin は通報を解決できる', async () => {
      const { data, error } = await moderator.client
        .from('reports')
        .update({ status: 'resolved' })
        .eq('post_id', alicePostId)
        .select('status');

      expect(error).toBeNull();
      expect(data?.[0]?.status).toBe('resolved');
    });
  });

  describe('categories / tags', () => {
    it('一般ユーザーは大カテゴリを作成できない', async () => {
      const { error } = await bob.client.from('major_categories').insert({
        id: `rls-${Date.now()}`,
        name: '勝手なカテゴリ',
        sort_order: 999,
      });

      expect(error).not.toBeNull();
    });

    it('admin は大カテゴリを作成・削除できる', async () => {
      const id = `rls-cat-${Date.now()}`;

      const { error: insertError } = await moderator.client
        .from('major_categories')
        .insert({ id, name: 'テストカテゴリ', sort_order: 999 });
      expect(insertError).toBeNull();

      const { error: deleteError } = await moderator.client
        .from('major_categories')
        .delete()
        .eq('id', id);
      expect(deleteError).toBeNull();
    });

    it('一般ユーザーはタグを作成できない', async () => {
      const { error } = await bob.client
        .from('tags')
        .insert({ id: `rls-tag-${Date.now()}`, name: '勝手なタグ', sort_order: 999 });

      expect(error).not.toBeNull();
    });
  });

  describe('退会（CASCADE）', () => {
    it('ユーザー削除で投稿も消える', async () => {
      const temp = await createTestUser(admin, 'temp');
      const tempPostId = await createPostAs(temp, majorCategoryId, '消える投稿');

      await admin.auth.admin.deleteUser(temp.id);

      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('id', temp.id)
        .maybeSingle();
      const { data: post } = await admin
        .from('posts')
        .select('id')
        .eq('id', tempPostId)
        .maybeSingle();

      expect(profile).toBeNull();
      expect(post).toBeNull();
    }, 30_000);
  });
});

describe.skipIf(reachable)('RLS / 権限（スキップ）', () => {
  it('ローカル Supabase が起動していないためスキップした', () => {
    expect(reachable).toBe(false);
  });
});
