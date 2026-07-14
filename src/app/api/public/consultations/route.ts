import { NextResponse } from 'next/server';
import { consultationSchema } from '@/lib/validation/public-forms';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Please review the required fields.' }, { status: 422 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ message: 'Request received.' });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('submit_public_consultation', {
      p_firm_slug: parsed.data.firmSlug,
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_requested_date: parsed.data.requestedDate,
      p_requested_time_window: parsed.data.requestedTimeWindow,
      p_consultation_mode: parsed.data.consultationMode,
      p_notes: parsed.data.notes,
      p_consent: parsed.data.consent,
    });

    if (error) {
      console.error('Public consultation insert failed', error.code);
      return NextResponse.json({ message: 'The request could not be submitted right now.' }, { status: 503 });
    }

    return NextResponse.json({ message: 'Request received.' }, { status: 201 });
  } catch (error) {
    console.error('Public consultation route failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ message: 'The consultation service is not configured.' }, { status: 503 });
  }
}
