import { describe, expect, it } from 'vitest';
import {
  contactSubmissionSchema,
  isContactTrapTripped,
} from '@/lib/contact/schema';

const valid = {
  kind: 'request' as const,
  name: '山田',
  email: 'User@Example.com',
  message: '検索の並び順を変えたいです。',
};

describe('contactSubmissionSchema', () => {
  it('必須項目を受け付け、メールは小文字にする', () => {
    const parsed = contactSubmissionSchema.parse(valid);
    expect(parsed.email).toBe('user@example.com');
    expect(parsed.name).toBe('山田');
    expect(parsed.kind).toBe('request');
  });

  it('名前が空なら null にする', () => {
    expect(contactSubmissionSchema.parse({ ...valid, name: '   ' }).name).toBeNull();
    expect(contactSubmissionSchema.parse({ ...valid, name: null }).name).toBeNull();
  });

  it('種別・メール・空本文を弾く', () => {
    expect(contactSubmissionSchema.safeParse({ ...valid, kind: 'hello' }).success).toBe(false);
    expect(contactSubmissionSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(
      false
    );
    expect(contactSubmissionSchema.safeParse({ ...valid, message: '   ' }).success).toBe(false);
  });

  it('長すぎる本文を弾く', () => {
    expect(
      contactSubmissionSchema.safeParse({ ...valid, message: 'あ'.repeat(2001) }).success
    ).toBe(false);
  });
});

describe('isContactTrapTripped', () => {
  it('空は通す', () => {
    expect(isContactTrapTripped(undefined)).toBe(false);
    expect(isContactTrapTripped('   ')).toBe(false);
  });

  it('値が入っていれば自動送信とみなす', () => {
    expect(isContactTrapTripped('http://spam.example')).toBe(true);
  });
});
