import { z } from 'zod';

export const CONTACT_KINDS = ['request', 'inquiry', 'bug', 'other'] as const;

export type ContactKind = (typeof CONTACT_KINDS)[number];

const emailSchema = z
  .string()
  .trim()
  .max(254)
  .transform((value) => value.toLowerCase())
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

export const contactSubmissionSchema = z.object({
  kind: z.enum(CONTACT_KINDS),
  name: z
    .union([z.string().trim().max(80), z.null()])
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  email: emailSchema,
  message: z.string().trim().min(1).max(2000),
  contactTrap: z.string().max(500).optional(),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/** 隠し欄に値が入っていれば自動送信とみなす */
export function isContactTrapTripped(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}
