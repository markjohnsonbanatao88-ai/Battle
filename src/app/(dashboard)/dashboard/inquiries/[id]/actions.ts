'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { MembershipRole } from '@/types/domain';

const inquiryIdSchema = z.string().uuid();
const staffRoles: MembershipRole[] = [
  'firm_admin',
  'managing_partner',
  'partner',
  'associate',
  'paralegal',
  'legal_secretary',
];
const lawyerRoles: MembershipRole[] = ['firm_admin', 'managing_partner', 'partner', 'associate'];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function go(inquiryId: string, notice: string, kind: 'success' | 'error' = 'success'): never {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/inquiries');
  revalidatePath(`/dashboard/inquiries/${inquiryId}`);
  const params = new URLSearchParams({ notice, kind });
  redirect(`/dashboard/inquiries/${inquiryId}?${params.toString()}`);
}

function safeDatabaseMessage(message: string) {
  const allowed = [
    'At least one opposing or adverse party is required',
    'Every conflict candidate must be reviewed before the overall decision',
    'No conflict check is ready for decision',
    'Conditions are required for conditional clearance',
    'Conflict clearance is required before scheduling',
    'The assigned lawyer already has an appointment during this time',
    'The assigned lawyer is not available for this firm',
    'The consultation is not linked to an intake',
  ];
  return allowed.find((entry) => message.includes(entry)) ?? 'The office action could not be completed. Please review the information and try again.';
}

async function contextFor(inquiryId: string, allowedRoles: MembershipRole[]) {
  const context = await requireFirmContext();
  if (!allowedRoles.includes(context.membership.role)) {
    go(inquiryId, 'Your office role is not allowed to perform this action.', 'error');
  }
  return context;
}

export async function startIntakeAction(formData: FormData) {
  const parsed = z
    .object({
      inquiryId: inquiryIdSchema,
      urgency: z.enum(['normal', 'urgent', 'critical']),
      jurisdiction: z.string().max(240),
      missingInformation: z.string().max(2000),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      urgency: text(formData, 'urgency'),
      jurisdiction: text(formData, 'jurisdiction'),
      missingInformation: text(formData, 'missingInformation'),
    });

  if (!parsed.success) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'Please review the intake information.', 'error');
  }

  await contextFor(parsed.data.inquiryId, staffRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('create_intake_from_inquiry', {
    p_inquiry_id: parsed.data.inquiryId,
    p_urgency: parsed.data.urgency,
    p_jurisdiction: parsed.data.jurisdiction || null,
    p_missing_information: parsed.data.missingInformation || null,
  });

  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'Staff review started. Add every client, opposing party and related organization before conflict checking.');
}

export async function addPartyAction(formData: FormData) {
  const rawAliases = text(formData, 'aliases');
  const parsed = z
    .object({
      inquiryId: inquiryIdSchema,
      intakeId: z.string().uuid(),
      partyType: z.enum(['person', 'organization']),
      displayName: z.string().min(2).max(240),
      partyRole: z.string().min(2).max(100),
      relationshipNote: z.string().max(1000),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      intakeId: text(formData, 'intakeId'),
      partyType: text(formData, 'partyType'),
      displayName: text(formData, 'displayName'),
      partyRole: text(formData, 'partyRole'),
      relationshipNote: text(formData, 'relationshipNote'),
    });

  if (!parsed.success) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'Enter the party name, type and role.', 'error');
  }

  const aliases = rawAliases
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 20);

  await contextFor(parsed.data.inquiryId, staffRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('add_intake_party', {
    p_intake_id: parsed.data.intakeId,
    p_party_type: parsed.data.partyType,
    p_display_name: parsed.data.displayName,
    p_party_role: parsed.data.partyRole,
    p_is_adverse: formData.get('isAdverse') === 'on',
    p_aliases: aliases,
    p_relationship_note: parsed.data.relationshipNote || null,
  });

  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'Party saved. Check the list carefully before running the conflict search.');
}

export async function runConflictCheckAction(formData: FormData) {
  const parsed = z
    .object({ inquiryId: inquiryIdSchema, intakeId: z.string().uuid() })
    .safeParse({ inquiryId: text(formData, 'inquiryId'), intakeId: text(formData, 'intakeId') });
  if (!parsed.success) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'The intake could not be submitted for checking.', 'error');
  }

  await contextFor(parsed.data.inquiryId, staffRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('run_conflict_check', { p_intake_id: parsed.data.intakeId });
  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'Conflict search completed. An authorized lawyer must review every warning and record the decision.');
}

export async function reviewCandidateAction(formData: FormData) {
  const parsed = z
    .object({
      inquiryId: inquiryIdSchema,
      candidateId: z.string().uuid(),
      reviewStatus: z.enum(['not_relevant', 'potential', 'confirmed', 'needs_more_information']),
      reason: z.string().min(5).max(2000),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      candidateId: text(formData, 'candidateId'),
      reviewStatus: text(formData, 'reviewStatus'),
      reason: text(formData, 'reason'),
    });
  if (!parsed.success) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'Select a finding and write a short reason.', 'error');
  }

  await contextFor(parsed.data.inquiryId, lawyerRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('review_conflict_candidate', {
    p_candidate_id: parsed.data.candidateId,
    p_review_status: parsed.data.reviewStatus,
    p_reason: parsed.data.reason,
  });
  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'Conflict warning reviewed and recorded.');
}

export async function recordDecisionAction(formData: FormData) {
  const parsed = z
    .object({
      inquiryId: inquiryIdSchema,
      intakeId: z.string().uuid(),
      disposition: z.enum(['cleared', 'conditional', 'conflicted', 'deferred']),
      reasoning: z.string().min(10).max(4000),
      conditions: z.string().max(4000),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      intakeId: text(formData, 'intakeId'),
      disposition: text(formData, 'disposition'),
      reasoning: text(formData, 'reasoning'),
      conditions: text(formData, 'conditions'),
    });
  if (!parsed.success) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'Select the lawyer decision and provide written reasoning.', 'error');
  }

  await contextFor(parsed.data.inquiryId, lawyerRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('record_conflict_decision', {
    p_intake_id: parsed.data.intakeId,
    p_disposition: parsed.data.disposition,
    p_reasoning: parsed.data.reasoning,
    p_conditions: parsed.data.conditions || null,
  });
  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'The lawyer decision was permanently recorded. Prior decisions cannot be edited or deleted.');
}

function manilaTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return `${value}:00+08:00`;
}

export async function scheduleConsultationAction(formData: FormData) {
  const start = manilaTimestamp(text(formData, 'scheduledStart'));
  const end = manilaTimestamp(text(formData, 'scheduledEnd'));
  const parsed = z
    .object({
      inquiryId: inquiryIdSchema,
      consultationId: z.string().uuid(),
      lawyerId: z.string().uuid(),
      start: z.string(),
      end: z.string(),
    })
    .safeParse({
      inquiryId: text(formData, 'inquiryId'),
      consultationId: text(formData, 'consultationId'),
      lawyerId: text(formData, 'lawyerId'),
      start,
      end,
    });
  const invalidTime = !start || !end || new Date(end).getTime() <= new Date(start).getTime();
  if (!parsed.success || invalidTime) {
    const fallback = text(formData, 'inquiryId');
    go(inquiryIdSchema.safeParse(fallback).success ? fallback : 'invalid', 'Select a lawyer and a valid start and end time.', 'error');
  }

  await contextFor(parsed.data.inquiryId, staffRoles);
  const supabase = await createClient();
  const { error } = await supabase.rpc('schedule_cleared_consultation', {
    p_consultation_id: parsed.data.consultationId,
    p_inquiry_id: parsed.data.inquiryId,
    p_assigned_lawyer_id: parsed.data.lawyerId,
    p_scheduled_start: start,
    p_scheduled_end: end,
  });
  if (error) go(parsed.data.inquiryId, safeDatabaseMessage(error.message), 'error');
  go(parsed.data.inquiryId, 'Consultation scheduled. The assigned lawyer and office time are now reserved.');
}
