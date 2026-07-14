import { NextResponse } from 'next/server';
import { inquirySchema } from '@/lib/validation/public-forms';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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
    const { error } = await supabase.rpc('submit_public_inquiry', {
      p_firm_slug: parsed.data.firmSlug,
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_preferred_contact: parsed.data.preferredContact,
      p_subject: parsed.data.subject,
      p_message: parsed.data.message,
      p_consent: parsed.data.consent,
    });

    if (error) {
      console.error('Public inquiry insert failed', error.code);
      return NextResponse.json({ message: 'The inquiry could not be submitted right now.' }, { status: 503 });
    }

    return NextResponse.json({ message: 'Inquiry received.' }, { status: 201 });
  } catch (error) {
    console.error('Public inquiry route failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ message: 'The inquiry service is not configured.' }, { status: 503 });
  }
}
