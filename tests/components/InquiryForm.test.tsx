import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InquiryForm } from '@/components/forms/InquiryForm';

describe('InquiryForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits a synthetic inquiry and displays the legal acknowledgment and public reference', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Inquiry received.',
          publicReference: 'INQ-ABC123DEF456',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<InquiryForm />);

    await user.type(screen.getByLabelText('Full name'), 'Synthetic Client');
    await user.type(screen.getByLabelText('Email'), 'client@example.test');
    await user.type(screen.getByLabelText('Subject'), 'Synthetic legal inquiry');
    await user.type(
      screen.getByLabelText('Short factual summary'),
      'This is a fictional inquiry used only for automated testing.',
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Submit inquiry' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'This acknowledgment does not create an attorney-client relationship.',
    );
    expect(screen.getByTestId('public-reference')).toHaveTextContent('INQ-ABC123DEF456');

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/public/inquiries');
    expect(options.method).toBe('POST');
    expect(JSON.parse(String(options.body))).toMatchObject({
      fullName: 'Synthetic Client',
      email: 'client@example.test',
      consent: true,
    });
  });
});
