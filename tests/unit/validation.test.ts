import { describe, expect, it } from 'vitest';
import {
  commentBodySchema,
  createPostSchema,
  getSafeHttpUrl,
  majorCategorySchema,
  reportDetailSchema,
  reportReasonSchema,
  updatePostSchema,
  updateProfileSchema,
} from '@/lib/validation/data';

const USER_ID = '11111111-1111-4111-8111-111111111111';

const validPost = {
  userId: USER_ID,
  majorCategoryId: 'cat-anime',
  title: 'おすすめの一本',
  description: '見てほしい理由をここに書きます。',
};

describe('createPostSchema', () => {
  it('必須項目だけでも通る', () => {
    expect(createPostSchema.parse(validPost)).toMatchObject({
      userId: USER_ID,
      title: 'おすすめの一本',
    });
  });

  it('前後の空白は落とす', () => {
    const parsed = createPostSchema.parse({ ...validPost, title: '  余白あり  ' });
    expect(parsed.title).toBe('余白あり');
  });

  it('userId がなくても通る（匿名掲示板）', () => {
    const { userId: _userId, ...withoutUser } = validPost;
    expect(createPostSchema.safeParse(withoutUser).success).toBe(true);
  });

  it('userId が UUID でなければ弾く', () => {
    expect(createPostSchema.safeParse({ ...validPost, userId: 'not-uuid' }).success).toBe(
      false
    );
  });

  it('空タイトルを弾く', () => {
    expect(createPostSchema.safeParse({ ...validPost, title: '   ' }).success).toBe(false);
  });

  it('100文字超のタイトルを弾く', () => {
    expect(
      createPostSchema.safeParse({ ...validPost, title: 'あ'.repeat(101) }).success
    ).toBe(false);
  });

  it('1000文字超の本文を弾く', () => {
    expect(
      createPostSchema.safeParse({ ...validPost, description: 'あ'.repeat(1001) }).success
    ).toBe(false);
  });

  it('おすすめの理由は空でも通る', () => {
    expect(createPostSchema.safeParse({ ...validPost, description: '' }).success).toBe(true);
    const parsed = createPostSchema.parse({ ...validPost, description: '   ' });
    expect(parsed.description).toBe('');
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>', 'file:///etc/passwd', 'ftp://a.example'])(
    'URL スキーム %s を弾く',
    (url) => {
      expect(createPostSchema.safeParse({ ...validPost, url }).success).toBe(false);
    }
  );

  it.each(['http://example.com', 'https://example.com/path?q=1'])(
    'URL %s を許可する',
    (url) => {
      expect(createPostSchema.safeParse({ ...validPost, url }).success).toBe(true);
    }
  );

  it('タグは20個までしか受け付けない', () => {
    const tagIds = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    expect(createPostSchema.safeParse({ ...validPost, tagIds }).success).toBe(false);
  });
});

describe('updatePostSchema', () => {
  it('部分更新を許可する', () => {
    expect(updatePostSchema.parse({ title: '新しい題名' })).toEqual({
      title: '新しい題名',
    });
  });

  it('url は null で消せる', () => {
    expect(updatePostSchema.parse({ url: null })).toEqual({ url: null });
  });

  it('空オブジェクトを弾く', () => {
    expect(updatePostSchema.safeParse({}).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('相対パスのアバターを許可する', () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: '/avatars/a.png' }).success).toBe(
      true
    );
  });

  it.each(['//evil.example/a.png', '/..%2f/a.png', '/a/../../secret.png', 'javascript:alert(1)'])(
    'あやしいアバターURL %s を弾く',
    (avatarUrl) => {
      expect(updateProfileSchema.safeParse({ avatarUrl }).success).toBe(false);
    }
  );

  it('空オブジェクトを弾く', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });
});

describe('commentBodySchema', () => {
  it('空白のみを弾く', () => {
    expect(commentBodySchema.safeParse('   ').success).toBe(false);
  });

  it('1000文字までは通る', () => {
    expect(commentBodySchema.safeParse('あ'.repeat(1000)).success).toBe(true);
  });

  it('1001文字は弾く', () => {
    expect(commentBodySchema.safeParse('あ'.repeat(1001)).success).toBe(false);
  });
});

describe('reportReasonSchema / reportDetailSchema', () => {
  it.each(['spam', 'inappropriate', 'misinformation', 'other'])(
    '通報理由 %s を許可する',
    (reason) => {
      expect(reportReasonSchema.safeParse(reason).success).toBe(true);
    }
  );

  it('未知の通報理由を弾く', () => {
    expect(reportReasonSchema.safeParse('whatever').success).toBe(false);
  });

  it('詳細は1000文字まで', () => {
    expect(reportDetailSchema.safeParse('あ'.repeat(1001)).success).toBe(false);
  });
});

describe('majorCategorySchema', () => {
  const valid = { id: 'cat-anime', name: 'アニメ', order: 1, isActive: true };

  it('妥当なカテゴリを通す', () => {
    expect(majorCategorySchema.parse(valid)).toMatchObject(valid);
  });

  it('order が小数なら弾く', () => {
    expect(majorCategorySchema.safeParse({ ...valid, order: 1.5 }).success).toBe(false);
  });

  it('order が負なら弾く', () => {
    expect(majorCategorySchema.safeParse({ ...valid, order: -1 }).success).toBe(false);
  });

  it('name が空なら弾く', () => {
    expect(majorCategorySchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('色は #rrggbb だけ受け付け、小文字にする', () => {
    const parsed = majorCategorySchema.parse({
      ...valid,
      palette: { from: '#AABBCC', to: '#112233', accent: '#445566' },
    });
    expect(parsed.palette).toEqual({ from: '#aabbcc', to: '#112233', accent: '#445566' });
    expect(
      majorCategorySchema.safeParse({
        ...valid,
        palette: { from: 'red', to: '#112233', accent: '#445566' },
      }).success
    ).toBe(false);
  });
});

describe('getSafeHttpUrl', () => {
  it('http(s) はそのまま返す', () => {
    expect(getSafeHttpUrl('https://example.com')).toBe('https://example.com');
  });

  it.each([null, undefined, '', 'javascript:alert(1)', 'not a url'])(
    '%s は null を返す',
    (value) => {
      expect(getSafeHttpUrl(value as string | null | undefined)).toBeNull();
    }
  );
});
