// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const rpc = vi.fn();
  const createClient = vi.fn();
  const requireFirmContext = vi.fn();
  const revalidatePath = vi.fn();
  const redirect = vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });

  return { rpc, createClient, requireFirmContext, revalidatePath, redirect };
});

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/auth/current-firm', () => ({ requireFirmContext: mocks.requireFirmContext }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));

import {
  recordDecisionAction,
  reviewCandidateAction,
  startIntakeAction,
} from '@/app/(dashboard)/dashboard/inquiries/[id]/actions';
import { createScheduledConsultationAction } from '@/app/(dashboard)/dashboard/inquiries/[id]/schedule-actions';

const inquiryId = '31000000-0000-0000-0000-000000000001';
const intakeId = '71000000-0000-0000-0000-000000000001';
const candidateId = '81000000-0000-0000-0000-000000000001';
const lawyerId = '11000000-0000-0000-0000-000000000002';

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function context(role: string) {
  return {
    userId: '11000000-0000-0000-0000-000000000001',
    userEmail: 'synthetic.staff@example.test',
    firm: {
      id: '21000000-0000-0000-0000-000000000001',
      name: 'Synthetic Firm',
      slug: 'synthetic-firm',
      status: 'active',
    },
    membership: {
      id: '91000000-0000-0000-0000-000000000001',
      firm_id: '21000000-0000-0000-0000-000000000001',
      user_id: '11000000-0000-0000-0000-000000000001',
      role,
      status: 'active',
      created_at: new Date().toISOString(),
    },
  };
}

describe('Phase 1A protected server actions', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.createClient.mockReset();
    mocks.requireFirmContext.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.redirect.mockClear();
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ error: null });
  });

  it('allows legal-secretary intake preparation through the controlled RPC', async () => {
    mocks.requireFirmContext.mockResolvedValue(context('legal_secretary'));

    await expect(
      startIntakeAction(
        form({
          inquiryId,
          urgency: 'urgent',
          jurisdiction: 'Synthetic jurisdiction',
          missingInformation: 'Synthetic missing-information note',
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT:');

    expect(mocks.rpc).toHaveBeenCalledWith('create_intake_from_inquiry', {
      p_inquiry_id: inquiryId,
      p_urgency: 'urgent',
      p_jurisdiction: 'Synthetic jurisdiction',
      p_missing_information: 'Synthetic missing-information note',
    });
  });

  it('blocks a technical firm administrator from recording the lawyer decision before opening a database client', async () => {
    mocks.requireFirmContext.mockResolvedValue(context('firm_admin'));

    await expect(
      recordDecisionAction(
        form({
          inquiryId,
          intakeId,
          disposition: 'cleared',
          reasoning: 'Synthetic lawyer reasoning that is long enough.',
          conditions: '',
        }),
      ),
    ).rejects.toThrow('Your+office+role+is+not+allowed');

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('allows a partner to review a conflict warning and sends only the validated payload', async () => {
    mocks.requireFirmContext.mockResolvedValue(context('partner'));

    await expect(
      reviewCandidateAction(
        form({
          inquiryId,
          candidateId,
          reviewStatus: 'potential',
          reason: 'The name matches an earlier synthetic matter party.',
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT:');

    expect(mocks.rpc).toHaveBeenCalledWith('review_conflict_candidate', {
      p_candidate_id: candidateId,
      p_review_status: 'potential',
      p_reason: 'The name matches an earlier synthetic matter party.',
    });
  });

  it('preserves a safe overlap warning when scheduling is rejected by PostgreSQL', async () => {
    mocks.requireFirmContext.mockResolvedValue(context('legal_secretary'));
    mocks.rpc.mockResolvedValue({
      error: { message: 'The assigned lawyer already has an appointment during this time' },
    });

    await expect(
      createScheduledConsultationAction(
        form({
          inquiryId,
          lawyerId,
          mode: 'office',
          notes: 'Synthetic consultation note',
          scheduledStart: '2026-08-03T09:00',
          scheduledEnd: '2026-08-03T10:00',
        }),
      ),
    ).rejects.toThrow('The+assigned+lawyer+already+has+an+appointment+during+this+time');

    expect(mocks.rpc).toHaveBeenCalledWith('create_scheduled_consultation_from_intake', {
      p_inquiry_id: inquiryId,
      p_assigned_lawyer_id: lawyerId,
      p_scheduled_start: '2026-08-03T09:00:00+08:00',
      p_scheduled_end: '2026-08-03T10:00:00+08:00',
      p_consultation_mode: 'office',
      p_notes: 'Synthetic consultation note',
    });
  });
});
