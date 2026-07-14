import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((value) => value || null);

export const inquirySchema = z.object({
  firmSlug: z.string().trim().min(2).max(80),
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  phone: phoneSchema,
  preferredContact: z.enum(['email', 'phone']),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});

export const consultationSchema = z.object({
  firmSlug: z.string().trim().min(2).max(80),
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  phone: phoneSchema,
  requestedDate: z.string().date(),
  requestedTimeWindow: z.string().trim().min(2).max(80),
  consultationMode: z.enum(['office', 'video', 'phone']),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || null),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
