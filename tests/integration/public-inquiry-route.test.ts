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

describe('POST /api/public/inquiries', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it('validates input and calls only the public inquiry RPC', async () => {
    rpcMock.mockResolvedValue({ error: null });
    const request = new Request('http://localhost/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ message: 'Inquiry received.' });
    expect(rpcMock).toHaveBeenCalledWith('submit_public_inquiry', {
      p_firm_slug: 'batalla-associates',
      p_full_name: 'Synthetic Client',
      p_email: 'client@example.test',
      p_phone: null,
      p_preferred_contact: 'email',
      p_subject: 'Synthetic legal inquiry',
      p_message: 'This is a fictional inquiry used only for automated testing.',
      p_consent: true,
    });
  });

  it('rejects malformed input before creating a Supabase client', async () => {
    const request = new Request('http://localhost/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, consent: false }),
    });

    const response = await POST(request);

    expect(response.status).toBe(422);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('does not reveal database errors to the public caller', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    rpcMock.mockResolvedValue({ error: { code: '42501' } });
    const request = new Request('http://localhost/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: 'The inquiry could not be submitted right now.',
    });
    expect(errorSpy).toHaveBeenCalledWith('Public inquiry insert failed', '42501');
  });

  it('silently accepts the honeypot without writing to the database', async () => {
    const request = new Request('http://localhost/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, website: 'bot-filled-field' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: 'Inquiry received.' });
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
