import { z } from 'zod';

const idSchema = z.string().trim().min(1).max(100);
const uuidSchema = z.uuid();

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'HTTP(S) URLを指定してください');

const avatarUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      (/^\/(?!\/)(?!.*\\)[^\u0000-\u001f\u007f]*$/.test(value) &&
        !value.includes('..')) ||
      httpUrlSchema.safeParse(value).success,
    '安全な画像URLを指定してください'
  );

export const createPostSchema = z.object({
  userId: uuidSchema,
  majorCategoryId: idSchema,
  subCategoryId: idSchema.nullish(),
  tagIds: z.array(idSchema).max(20).optional(),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000),
  url: httpUrlSchema.optional(),
});

export const updatePostSchema = createPostSchema
  .omit({ userId: true })
  .partial()
  .extend({ url: httpUrlSchema.nullable().optional() })
  .refine((value) => Object.keys(value).length > 0, '更新内容がありません');

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(50).optional(),
    avatarUrl: avatarUrlSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, '更新内容がありません');

export const postIdSchema = uuidSchema;
export const userIdSchema = uuidSchema;
export const commentIdSchema = uuidSchema;
export const categoryIdSchema = idSchema;

export const commentBodySchema = z.string().trim().min(1).max(1000);

export const reportReasonSchema = z.enum([
  'spam',
  'inappropriate',
  'misinformation',
  'other',
]);

export const reportDetailSchema = z.string().trim().max(1000);

export const majorCategorySchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(50),
  icon: z.string().trim().max(50).optional(),
  order: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

/** 保存済みデータをリンク表示する際も危険なスキームを除外する。 */
export function getSafeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = httpUrlSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
