-- Phase 1A legal gate fixes found during adversarial review.

create or replace function public.record_conflict_decision(
  p_intake_id uuid,
  p_disposition text,
  p_reasoning text,
  p_conditions text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_check_id uuid;
  v_version integer;
  v_decision_id uuid;
begin
  select firm_id into v_firm_id from public.intakes where id = p_intake_id;
  if v_firm_id is null or not public.has_firm_role(
    v_firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate']::public.membership_role[]
  ) then
    raise exception 'Intake not available';
  end if;
  if p_disposition not in ('cleared', 'conditional', 'conflicted', 'deferred')
     or char_length(trim(p_reasoning)) not between 10 and 4000 then
    raise exception 'A valid disposition and written reasoning are required';
  end if;
  if p_disposition = 'conditional' and char_length(coalesce(trim(p_conditions), '')) < 5 then
    raise exception 'Conditions are required for conditional clearance';
  end if;

  select id into v_check_id
  from public.conflict_checks
  where intake_id = p_intake_id and status = 'review_required'
  order by search_version desc
  limit 1;
  if v_check_id is null then
    raise exception 'No conflict check is ready for decision';
  end if;
  if exists (
    select 1 from public.conflict_candidates
    where conflict_check_id = v_check_id and review_status = 'unreviewed'
  ) then
    raise exception 'Every conflict candidate must be reviewed before the overall decision';
  end if;

  select coalesce(max(decision_version), 0) + 1 into v_version
  from public.conflict_decisions where intake_id = p_intake_id;

  insert into public.conflict_decisions (
    firm_id, intake_id, conflict_check_id, decision_version, disposition,
    reasoning, conditions, decided_by
  ) values (
    v_firm_id, p_intake_id, v_check_id, v_version, p_disposition,
    trim(p_reasoning), nullif(trim(p_conditions), ''), auth.uid()
  ) returning id into v_decision_id;

  update public.conflict_checks set status = 'decision_recorded' where id = v_check_id;
  update public.intakes
  set status = p_disposition, row_version = row_version + 1
  where id = p_intake_id;

  update public.inquiries i
  set status = case
    when p_disposition in ('cleared', 'conditional') then 'accepted'::public.inquiry_status
    when p_disposition = 'conflicted' then 'declined'::public.inquiry_status
    else 'conflict_check'::public.inquiry_status
  end
  from public.intakes intake
  where intake.id = p_intake_id and i.id = intake.inquiry_id;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id, auth.uid(), 'conflict.decision_recorded', 'conflict_decisions', v_decision_id,
    jsonb_build_object('intake_id', p_intake_id, 'disposition', p_disposition, 'decision_version', v_version)
  );

  return v_decision_id;
end;
$$;

create or replace function public.schedule_cleared_consultation(
  p_consultation_id uuid,
  p_inquiry_id uuid,
  p_assigned_lawyer_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_intake_id uuid;
  v_disposition text;
begin
  select firm_id into v_firm_id from public.consultation_requests where id = p_consultation_id;
  if v_firm_id is null or not public.has_firm_role(
    v_firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ) then
    raise exception 'Consultation request not available';
  end if;
  if p_scheduled_start is null or p_scheduled_end is null or p_scheduled_end <= p_scheduled_start then
    raise exception 'A valid consultation time is required';
  end if;
  if not exists (
    select 1 from public.firm_memberships fm
    where fm.firm_id = v_firm_id
      and fm.user_id = p_assigned_lawyer_id
      and fm.status = 'active'
      and fm.role in ('firm_admin', 'managing_partner', 'partner', 'associate')
  ) then
    raise exception 'The assigned lawyer is not available for this firm';
  end if;

  select intake.id into v_intake_id
  from public.intakes intake
  where intake.inquiry_id = p_inquiry_id and intake.firm_id = v_firm_id;
  if v_intake_id is null then
    raise exception 'The consultation is not linked to an intake';
  end if;

  select disposition into v_disposition
  from public.conflict_decisions
  where intake_id = v_intake_id
  order by decision_version desc
  limit 1;
  if v_disposition is null or v_disposition not in ('cleared', 'conditional') then
    raise exception 'Conflict clearance is required before scheduling';
  end if;

  if exists (
    select 1 from public.consultation_requests existing
    where existing.firm_id = v_firm_id
      and existing.assigned_to = p_assigned_lawyer_id
      and existing.status = 'confirmed'
      and existing.id <> p_consultation_id
      and tstzrange(existing.scheduled_start, existing.scheduled_end, '[)') &&
          tstzrange(p_scheduled_start, p_scheduled_end, '[)')
  ) then
    raise exception 'The assigned lawyer already has an appointment during this time';
  end if;

  update public.consultation_requests
  set inquiry_id = p_inquiry_id,
      assigned_to = p_assigned_lawyer_id,
      scheduled_start = p_scheduled_start,
      scheduled_end = p_scheduled_end,
      status = 'confirmed'
  where id = p_consultation_id;

  update public.intakes
  set status = 'consultation_scheduled', row_version = row_version + 1
  where id = v_intake_id;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id, auth.uid(), 'consultation.scheduled', 'consultation_requests', p_consultation_id,
    jsonb_build_object(
      'inquiry_id', p_inquiry_id,
      'assigned_lawyer_id', p_assigned_lawyer_id,
      'scheduled_start', p_scheduled_start,
      'scheduled_end', p_scheduled_end
    )
  );
end;
$$;
