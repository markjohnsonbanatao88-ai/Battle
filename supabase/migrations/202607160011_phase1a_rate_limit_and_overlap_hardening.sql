-- Phase 1A hardening: rate-limit counters must commit, and double-booking must be database-authoritative.

create or replace function public.submit_public_inquiry(
  p_firm_slug text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_preferred_contact text,
  p_subject text,
  p_message text,
  p_consent boolean,
  p_request_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_id uuid;
  v_public_reference text;
  v_attempts integer;
  v_window timestamptz := date_trunc('hour', now());
begin
  if p_consent is not true then
    raise exception 'Consent is required';
  end if;
  if p_request_fingerprint is null or p_request_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid request fingerprint';
  end if;
  if char_length(trim(p_full_name)) not between 2 and 150
     or char_length(trim(p_email)) > 254
     or char_length(trim(p_subject)) not between 3 and 200
     or char_length(trim(p_message)) not between 20 and 5000
     or p_preferred_contact not in ('email', 'phone') then
    raise exception 'Invalid inquiry';
  end if;

  select id into v_firm_id
  from public.firms
  where slug = p_firm_slug and status = 'active';
  if v_firm_id is null then
    raise exception 'Firm not found';
  end if;

  insert into public.public_submission_rate_limits (
    firm_id, fingerprint_hash, window_started_at, attempt_count
  ) values (
    v_firm_id, p_request_fingerprint, v_window, 1
  )
  on conflict (firm_id, fingerprint_hash, window_started_at)
  do update set
    attempt_count = public.public_submission_rate_limits.attempt_count + 1,
    updated_at = now()
  returning attempt_count into v_attempts;

  -- Return normally so the counter commits. Raising here would roll back the increment.
  if v_attempts > 5 then
    return jsonb_build_object('rateLimited', true);
  end if;

  insert into public.inquiries (
    firm_id, full_name, email, phone, preferred_contact, subject, message, consent_at
  ) values (
    v_firm_id, trim(p_full_name), lower(trim(p_email)), nullif(trim(p_phone), ''),
    p_preferred_contact, trim(p_subject), trim(p_message), now()
  ) returning id, public_reference into v_id, v_public_reference;

  insert into public.audit_events (firm_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id,
    'inquiry.public_submitted',
    'inquiries',
    v_id,
    jsonb_build_object('public_reference', v_public_reference, 'source', 'website')
  );

  return jsonb_build_object('inquiryId', v_id, 'publicReference', v_public_reference);
end;
$$;

-- The function checks for a friendly error; this exclusion constraint closes concurrent-write races.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'consultations_no_lawyer_overlap'
      and conrelid = 'public.consultation_requests'::regclass
  ) then
    alter table public.consultation_requests
      add constraint consultations_no_lawyer_overlap
      exclude using gist (
        firm_id with =,
        assigned_to with =,
        tstzrange(scheduled_start, scheduled_end, '[)') with &&
      )
      where (
        status = 'confirmed'::public.consultation_status
        and assigned_to is not null
        and scheduled_start is not null
        and scheduled_end is not null
      );
  end if;
end;
$$;
