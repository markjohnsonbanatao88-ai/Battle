import { describe, expect, it } from 'vitest';
import { consultationSchema, inquirySchema } from '@/lib/validation/public-forms';

const validInquiry = {
  firmSlug: 'batalla-associates',
  fullName: '  Synthetic Client  ',
  email: 'client@example.test',
  phone: '',
  preferredContact: 'email' as const,
  subject: 'Synthetic legal inquiry',
  message: 'This is a fictional inquiry used only for automated testing.',
  consent: true as const,
  website: '',
};

describe('public form validation', () => {
  it('normalizes a valid inquiry without inventing authorization data', () => {
    const result = inquirySchema.parse(validInquiry);

    expect(result.fullName).toBe('Synthetic Client');
    expect(result.phone).toBeNull();
    expect(result.firmSlug).toBe('batalla-associates');
  });

  it('rejects an inquiry without explicit consent', () => {
    const result = inquirySchema.safeParse({ ...validInquiry, consent: false });

    expect(result.success).toBe(false);
  });

  it('rejects consultation dates that are not ISO calendar dates', () => {
    const result = consultationSchema.safeParse({
      firmSlug: 'batalla-associates',
      fullName: 'Synthetic Client',
      email: 'client@example.test',
      phone: '',
      requestedDate: '15/07/2026',
      requestedTimeWindow: 'Morning',
      consultationMode: 'office',
      notes: '',
      consent: true,
      website: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'requestedDate')).toBe(true);
    }
  });
});
