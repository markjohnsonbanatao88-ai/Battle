-- Allow staff to complete the Phase 1A journey even when the prospect did not submit a separate booking form.

create or replace function public.create_scheduled_consultation_from_intake(
  p_inquiry_id uuid,
  p_assigned_lawyer_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_consultation_mode text default 'office',
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inquiry public.inquiries%rowtype;
  v_consultation_id uuid;
begin
  select * into v_inquiry from public.inquiries where id = p_inquiry_id;
  if v_inquiry.id is null or not public.has_firm_role(
    v_inquiry.firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ) then
    raise exception 'Inquiry not available';
  end if;
  if p_consultation_mode not in ('office', 'video', 'phone') then
    raise exception 'Select a valid consultation method';
  end if;

  insert into public.consultation_requests (
    firm_id, inquiry_id, full_name, email, phone,
    requested_date, requested_time_window, consultation_mode,
    notes, consent_at, status
  ) values (
    v_inquiry.firm_id,
    v_inquiry.id,
    v_inquiry.full_name,
    v_inquiry.email,
    v_inquiry.phone,
    (p_scheduled_start at time zone 'Asia/Manila')::date,
    'Scheduled by office after conflict clearance',
    p_consultation_mode,
    nullif(trim(p_notes), ''),
    v_inquiry.consent_at,
    'requested'
  ) returning id into v_consultation_id;

  perform public.schedule_cleared_consultation(
    v_consultation_id,
    v_inquiry.id,
    p_assigned_lawyer_id,
    p_scheduled_start,
    p_scheduled_end
  );

  return v_consultation_id;
end;
$$;

revoke all on function public.create_scheduled_consultation_from_intake(uuid, uuid, timestamptz, timestamptz, text, text) from public;
grant execute on function public.create_scheduled_consultation_from_intake(uuid, uuid, timestamptz, timestamptz, text, text) to authenticated;
