// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClientMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}));

import { POST } from '@/app/api/public/inquiries/route';

const validPayload = {
  firmSlug: 'batalla-associates',
  fullName: 'Synthetic Client',
  email: 'client@example.test',
  phone: '',
  preferredContact: 'email',
  subject: 'Synthetic legal inquiry',
  message: 'This is a fictional inquiry used only for automated testing.',
  consent: true,
  website: '',
};

function request(payload = validPayload) {
  return new Request('http://localhost/api/public/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.0.2.10',
      'user-agent': 'BatallaOS-Test-Agent',
    },
    body: JSON.stringify(payload),
  });
}

describe('POST /api/public/inquiries', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it('validates input, calls only the public inquiry RPC and returns the public reference', async () => {
    rpcMock.mockResolvedValue({
      data: {
        inquiryId: '30000000-0000-0000-0000-000000000001',
        publicReference: 'INQ-ABC123DEF456',
      },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: 'Inquiry received.',
      publicReference: 'INQ-ABC123DEF456',
    });
    expect(rpcMock).toHaveBeenCalledWith('submit_public_inquiry', {
      p_firm_slug: 'batalla-associates',
      p_full_name: 'Synthetic Client',
      p_email: 'client@example.test',
      p_phone: null,
      p_preferred_contact: 'email',
      p_subject: 'Synthetic legal inquiry',
      p_message: 'This is a fictional inquiry used only for automated testing.',
      p_consent: true,
      p_request_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it('rejects malformed input before creating a Supabase client', async () => {
    const response = await POST(request({ ...validPayload, consent: false }));

    expect(response.status).toBe(422);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('does not reveal database errors to the public caller', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    rpcMock.mockResolvedValue({ data: null, error: { code: '42501' } });

    const response = await POST(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: 'The inquiry could not be submitted right now.',
    });
    expect(errorSpy).toHaveBeenCalledWith('Public inquiry insert failed', '42501');
  });

  it('returns a safe 429 response when the database rate limit is reached', async () => {
    rpcMock.mockResolvedValue({ data: { rateLimited: true }, error: null });

    const response = await POST(request());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      message: 'Too many inquiries were submitted from this connection. Please contact the office directly or try again later.',
    });
  });

  it('silently accepts the honeypot without writing to the database', async () => {
    const response = await POST(request({ ...validPayload, website: 'bot-filled-field' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: 'Inquiry received.' });
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
