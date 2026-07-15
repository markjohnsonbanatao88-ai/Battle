import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { inquirySchema } from '@/lib/validation/public-forms';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface InquiryRpcResult {
  inquiryId?: string;
  publicReference?: string;
  rateLimited?: boolean;
}

function requestFingerprint(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${forwardedFor}|${userAgent}`).digest('hex');
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Please review the required fields.' }, { status: 422 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ message: 'Inquiry received.' });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('submit_public_inquiry', {
      p_firm_slug: parsed.data.firmSlug,
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_preferred_contact: parsed.data.preferredContact,
      p_subject: parsed.data.subject,
      p_message: parsed.data.message,
      p_consent: parsed.data.consent,
      p_request_fingerprint: requestFingerprint(request),
    });

    if (error) {
      console.error('Public inquiry insert failed', error.code);
      return NextResponse.json({ message: 'The inquiry could not be submitted right now.' }, { status: 503 });
    }

    const result = (data ?? {}) as InquiryRpcResult;
    if (result.rateLimited) {
      return NextResponse.json(
        { message: 'Too many inquiries were submitted from this connection. Please contact the office directly or try again later.' },
        { status: 429 },
      );
    }

    if (!result.publicReference) {
      console.error('Public inquiry RPC returned no reference');
      return NextResponse.json({ message: 'The inquiry could not be submitted right now.' }, { status: 503 });
    }

    return NextResponse.json(
      {
        message: 'Inquiry received.',
        publicReference: result.publicReference,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Public inquiry route failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ message: 'The inquiry service is not configured.' }, { status: 503 });
  }
}
