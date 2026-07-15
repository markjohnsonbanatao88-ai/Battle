'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { MembershipRole } from '@/types/domain';

const staffRoles: MembershipRole[] = [
  'firm_admin',
  'managing_partner',
  'partner',
  'associate',
  'paralegal',
  'legal_secretary',
];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function manilaTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return `${value}:00+08:00`;
}

function finish(inquiryId: string, notice: string, kind: 'success' | 'error' = 'success'): never {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/consultations');
  revalidatePath(`/dashboard/inquiries/${inquiryId}`);
  redirect(`/dashboard/inquiries/${inquiryId}?${new URLSearchParams({ notice, kind }).toString()}`);
}

function safeMessage(message: string) {
  const allowed = [
    'Conflict clearance is required before scheduling',
    'The assigned lawyer already has an appointment during this time',
    'The assigned lawyer is not available for this firm',
    'Select a valid consultation method',
  ];
  return allowed.find((entry) => message.includes(entry)) ?? 'The consultation could not be scheduled. Please review the information and try again.';
}

export async function createScheduledConsultationAction(formData: FormData) {
  const start = manilaTimestamp(text(formData, 'scheduledStart'));
  const end = manilaTimestamp(text(formData, 'scheduledEnd'));
  const parsed = z
    .object({
      inquiryId: z.string().uuid(),
      lawyerId: z.string().uuid(),
      mode: z.enum(['office', 'video', 'phone']),
      notes: z.string().max(2000),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      lawyerId: text(formData, 'lawyerId'),
      mode: text(formData, 'mode'),
      notes: text(formData, 'notes'),
    });

  const fallback = text(formData, 'inquiryId');
  const invalidTime = !start || !end || new Date(end).getTime() <= new Date(start).getTime();
  if (!parsed.success || invalidTime) {
    finish(z.string().uuid().safeParse(fallback).success ? fallback : 'invalid', 'Select a lawyer and a valid start and end time.', 'error');
  }

  const context = await requireFirmContext();
  if (!staffRoles.includes(context.membership.role)) {
    finish(parsed.data.inquiryId, 'Your office role is not allowed to schedule consultations.', 'error');
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_scheduled_consultation_from_intake', {
    p_inquiry_id: parsed.data.inquiryId,
    p_assigned_lawyer_id: parsed.data.lawyerId,
    p_scheduled_start: start,
    p_scheduled_end: end,
    p_consultation_mode: parsed.data.mode,
    p_notes: parsed.data.notes || null,
  });

  if (error) finish(parsed.data.inquiryId, safeMessage(error.message), 'error');
  finish(parsed.data.inquiryId, 'Consultation scheduled. The lawyer and office time are now reserved.');
}
