-- BatallaOS Phase 1A
-- Public inquiry -> staff intake -> party capture -> conflict warning -> lawyer decision -> consultation scheduling.
-- This migration is additive. It preserves original submissions and makes legally significant decisions append-only.

create extension if not exists btree_gist;

create sequence if not exists public.inquiry_internal_number_seq;

alter table public.inquiries
  add column if not exists public_reference text,
  add column if not exists internal_reference text,
  add column if not exists source text not null default 'website',
  add column if not exists campaign text,
  add column if not exists row_version bigint not null default 1;

update public.inquiries
set
  public_reference = coalesce(public_reference, 'INQ-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 12))),
  internal_reference = coalesce(
    internal_reference,
    'BAT-I-' || extract(year from created_at)::text || '-' || lpad(nextval('public.inquiry_internal_number_seq')::text, 6, '0')
  )
where public_reference is null or internal_reference is null;

alter table public.inquiries
  alter column public_reference set not null,
  alter column internal_reference set not null;

create unique index if not exists inquiries_public_reference_uidx
  on public.inquiries(public_reference);
create unique index if not exists inquiries_firm_internal_reference_uidx
  on public.inquiries(firm_id, internal_reference);

create table if not exists public.public_submission_rate_limits (
  firm_id uuid not null references public.firms(id) on delete cascade,
  fingerprint_hash text not null check (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  attempt_count integer not null default 1 check (attempt_count > 0),
  updated_at timestamptz not null default now(),
  primary key (firm_id, fingerprint_hash, window_started_at)
);

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  inquiry_id uuid not null,
  status text not null default 'new' check (
    status in (
      'new', 'triage', 'awaiting_information', 'ready_for_conflict_check',
      'conflict_review', 'cleared', 'conditional', 'conflicted', 'deferred',
      'consultation_pending', 'consultation_scheduled', 'declined', 'closed'
    )
  ),
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent', 'critical')),
  summary text not null,
  jurisdiction text,
  missing_information text,
  owner_user_id uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inquiry_id),
  unique (id, firm_id),
  foreign key (inquiry_id, firm_id) references public.inquiries(id, firm_id) on delete restrict
);

create index if not exists intakes_firm_status_idx
  on public.intakes(firm_id, status, updated_at desc);
create index if not exists intakes_owner_status_idx
  on public.intakes(firm_id, owner_user_id, status);

create table if not exists public.intake_parties (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  intake_id uuid not null,
  contact_id uuid,
  party_type text not null check (party_type in ('person', 'organization')),
  display_name text not null check (char_length(display_name) between 2 and 240),
  normalized_name text not null,
  party_role text not null check (char_length(party_role) between 2 and 100),
  is_adverse boolean not null default false,
  aliases text[] not null default '{}',
  relationship_note text check (relationship_note is null or char_length(relationship_note) <= 1000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (id, firm_id),
  foreign key (intake_id, firm_id) references public.intakes(id, firm_id) on delete cascade,
  foreign key (contact_id, firm_id) references public.contacts(id, firm_id) on delete restrict
);

create index if not exists intake_parties_search_idx
  on public.intake_parties(firm_id, normalized_name);
create index if not exists intake_parties_intake_idx
  on public.intake_parties(intake_id, is_adverse, created_at);

create table if not exists public.conflict_checks (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  intake_id uuid not null,
  status text not null default 'draft' check (
    status in ('draft', 'searching', 'review_required', 'decision_recorded', 'superseded')
  ),
  search_version integer not null check (search_version > 0),
  input_snapshot jsonb not null,
  requested_by uuid not null references auth.users(id) on delete restrict,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (intake_id, search_version),
  unique (id, firm_id),
  foreign key (intake_id, firm_id) references public.intakes(id, firm_id) on delete cascade
);

create table if not exists public.conflict_search_terms (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  conflict_check_id uuid not null,
  source_party_id uuid,
  searched_name text not null,
  normalized_name text not null,
  created_at timestamptz not null default now(),
  foreign key (conflict_check_id, firm_id) references public.conflict_checks(id, firm_id) on delete cascade,
  foreign key (source_party_id, firm_id) references public.intake_parties(id, firm_id) on delete set null
);

create index if not exists conflict_search_terms_name_idx
  on public.conflict_search_terms(firm_id, normalized_name);

create table if not exists public.conflict_candidates (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  conflict_check_id uuid not null,
  search_term_id uuid not null references public.conflict_search_terms(id) on delete cascade,
  matched_source text not null check (matched_source in ('contact', 'contact_alias', 'prior_intake', 'matter_party')),
  matched_id uuid not null,
  matched_display_name text not null,
  match_reason text not null,
  match_score integer not null check (match_score between 0 and 100),
  review_status text not null default 'unreviewed' check (
    review_status in ('unreviewed', 'not_relevant', 'potential', 'confirmed', 'needs_more_information')
  ),
  reviewer_reason text,
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (conflict_check_id, firm_id) references public.conflict_checks(id, firm_id) on delete cascade
);

create index if not exists conflict_candidates_check_idx
  on public.conflict_candidates(conflict_check_id, review_status, match_score desc);

create table if not exists public.conflict_decisions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  intake_id uuid not null,
  conflict_check_id uuid not null,
  decision_version integer not null check (decision_version > 0),
  disposition text not null check (disposition in ('cleared', 'conditional', 'conflicted', 'deferred')),
  reasoning text not null check (char_length(reasoning) between 10 and 4000),
  conditions text check (conditions is null or char_length(conditions) <= 4000),
  decided_by uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now(),
  unique (intake_id, decision_version),
  foreign key (intake_id, firm_id) references public.intakes(id, firm_id) on delete restrict,
  foreign key (conflict_check_id, firm_id) references public.conflict_checks(id, firm_id) on delete restrict
);

create index if not exists conflict_decisions_intake_idx
  on public.conflict_decisions(intake_id, decision_version desc);

create or replace function public.normalize_conflict_name(p_value text)
returns text
language sql
immutable
strict
as $$
  select lower(regexp_replace(trim(p_value), '[^[:alnum:]]+', '', 'g'));
$$;

create or replace function public.assign_inquiry_references()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.public_reference is null then
    new.public_reference := 'INQ-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 12));
  end if;
  if new.internal_reference is null then
    new.internal_reference := 'BAT-I-' || extract(year from coalesce(new.created_at, now()))::text || '-' ||
      lpad(nextval('public.inquiry_internal_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists inquiries_assign_references on public.inquiries;
create trigger inquiries_assign_references
before insert on public.inquiries
for each row execute function public.assign_inquiry_references();

create or replace function public.protect_inquiry_original_submission()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if row(
    old.full_name, old.email, old.phone, old.preferred_contact, old.subject,
    old.message, old.consent_at, old.public_reference, old.internal_reference,
    old.source, old.campaign, old.firm_id, old.created_at
  ) is distinct from row(
    new.full_name, new.email, new.phone, new.preferred_contact, new.subject,
    new.message, new.consent_at, new.public_reference, new.internal_reference,
    new.source, new.campaign, new.firm_id, new.created_at
  ) then
    raise exception 'The original inquiry submission cannot be changed';
  end if;
  new.row_version := old.row_version + 1;
  return new;
end;
$$;

drop trigger if exists inquiries_protect_original on public.inquiries;
create trigger inquiries_protect_original
before update on public.inquiries
for each row execute function public.protect_inquiry_original_submission();

create trigger intakes_set_updated_at
before update on public.intakes
for each row execute function public.set_updated_at();

alter table public.public_submission_rate_limits enable row level security;
alter table public.intakes enable row level security;
alter table public.intake_parties enable row level security;
alter table public.conflict_checks enable row level security;
alter table public.conflict_search_terms enable row level security;
alter table public.conflict_candidates enable row level security;
alter table public.conflict_decisions enable row level security;

create policy intakes_select_team on public.intakes
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy intake_parties_select_team on public.intake_parties
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy conflict_checks_select_team on public.conflict_checks
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy conflict_search_terms_select_team on public.conflict_search_terms
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy conflict_candidates_select_team on public.conflict_candidates
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy conflict_decisions_select_team on public.conflict_decisions
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

-- Public submissions now return only a random public reference. Internal numbering never leaves the office boundary.
drop function if exists public.submit_public_inquiry(text, text, text, text, text, text, text, boolean);
create function public.submit_public_inquiry(
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

  if v_attempts > 5 then
    raise exception using errcode = 'P0001', message = 'RATE_LIMITED';
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

create or replace function public.create_intake_from_inquiry(
  p_inquiry_id uuid,
  p_urgency text default 'normal',
  p_jurisdiction text default null,
  p_missing_information text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inquiry public.inquiries%rowtype;
  v_intake_id uuid;
begin
  select * into v_inquiry from public.inquiries where id = p_inquiry_id;
  if v_inquiry.id is null or not public.has_firm_role(
    v_inquiry.firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ) then
    raise exception 'Inquiry not available';
  end if;
  if p_urgency not in ('normal', 'urgent', 'critical') then
    raise exception 'Invalid urgency';
  end if;

  insert into public.intakes (
    firm_id, inquiry_id, status, urgency, summary, jurisdiction,
    missing_information, owner_user_id, created_by
  ) values (
    v_inquiry.firm_id, v_inquiry.id, 'triage', p_urgency, v_inquiry.message,
    nullif(trim(p_jurisdiction), ''), nullif(trim(p_missing_information), ''),
    auth.uid(), auth.uid()
  )
  on conflict (inquiry_id) do update set owner_user_id = coalesce(public.intakes.owner_user_id, auth.uid())
  returning id into v_intake_id;

  insert into public.intake_parties (
    firm_id, intake_id, party_type, display_name, normalized_name,
    party_role, is_adverse, created_by
  )
  select
    v_inquiry.firm_id, v_intake_id, 'person', v_inquiry.full_name,
    public.normalize_conflict_name(v_inquiry.full_name), 'prospective_client', false, auth.uid()
  where not exists (
    select 1 from public.intake_parties
    where intake_id = v_intake_id and party_role = 'prospective_client'
  );

  update public.inquiries
  set status = case when status = 'new' then 'reviewing' else status end,
      assigned_to = coalesce(assigned_to, auth.uid())
  where id = v_inquiry.id;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_inquiry.firm_id, auth.uid(), 'intake.created', 'intakes', v_intake_id,
    jsonb_build_object('inquiry_id', v_inquiry.id)
  );

  return v_intake_id;
end;
$$;

create or replace function public.add_intake_party(
  p_intake_id uuid,
  p_party_type text,
  p_display_name text,
  p_party_role text,
  p_is_adverse boolean,
  p_aliases text[] default '{}',
  p_relationship_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_party_id uuid;
  v_aliases text[];
begin
  select firm_id into v_firm_id from public.intakes where id = p_intake_id;
  if v_firm_id is null or not public.has_firm_role(
    v_firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ) then
    raise exception 'Intake not available';
  end if;
  if p_party_type not in ('person', 'organization')
     or char_length(trim(p_display_name)) not between 2 and 240
     or char_length(trim(p_party_role)) not between 2 and 100 then
    raise exception 'Invalid party';
  end if;

  select coalesce(array_agg(trim(value)) filter (where char_length(trim(value)) between 2 and 240), '{}')
  into v_aliases
  from unnest(coalesce(p_aliases, '{}')) value;

  insert into public.intake_parties (
    firm_id, intake_id, party_type, display_name, normalized_name, party_role,
    is_adverse, aliases, relationship_note, created_by
  ) values (
    v_firm_id, p_intake_id, p_party_type, trim(p_display_name),
    public.normalize_conflict_name(p_display_name), trim(p_party_role),
    p_is_adverse, v_aliases, nullif(trim(p_relationship_note), ''), auth.uid()
  ) returning id into v_party_id;

  update public.intakes
  set status = 'ready_for_conflict_check', row_version = row_version + 1
  where id = p_intake_id and status in ('new', 'triage', 'awaiting_information');

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id, auth.uid(), 'intake.party_added', 'intake_parties', v_party_id,
    jsonb_build_object('intake_id', p_intake_id, 'party_role', p_party_role, 'is_adverse', p_is_adverse)
  );

  return v_party_id;
end;
$$;

create or replace function public.run_conflict_check(p_intake_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_check_id uuid;
  v_version integer;
begin
  select firm_id into v_firm_id from public.intakes where id = p_intake_id;
  if v_firm_id is null or not public.has_firm_role(
    v_firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ) then
    raise exception 'Intake not available';
  end if;
  if not exists (select 1 from public.intake_parties where intake_id = p_intake_id and is_adverse) then
    raise exception 'At least one opposing or adverse party is required';
  end if;

  select coalesce(max(search_version), 0) + 1 into v_version
  from public.conflict_checks where intake_id = p_intake_id;

  update public.conflict_checks set status = 'superseded'
  where intake_id = p_intake_id and status = 'decision_recorded';

  insert into public.conflict_checks (
    firm_id, intake_id, status, search_version, input_snapshot, requested_by
  )
  select
    v_firm_id,
    p_intake_id,
    'searching',
    v_version,
    jsonb_agg(jsonb_build_object(
      'partyId', ip.id,
      'displayName', ip.display_name,
      'partyRole', ip.party_role,
      'isAdverse', ip.is_adverse,
      'aliases', ip.aliases
    ) order by ip.created_at),
    auth.uid()
  from public.intake_parties ip
  where ip.intake_id = p_intake_id
  returning id into v_check_id;

  insert into public.conflict_search_terms (
    firm_id, conflict_check_id, source_party_id, searched_name, normalized_name
  )
  select v_firm_id, v_check_id, ip.id, ip.display_name, ip.normalized_name
  from public.intake_parties ip where ip.intake_id = p_intake_id
  union all
  select v_firm_id, v_check_id, ip.id, alias_value, public.normalize_conflict_name(alias_value)
  from public.intake_parties ip
  cross join lateral unnest(ip.aliases) alias_value
  where ip.intake_id = p_intake_id;

  insert into public.conflict_candidates (
    firm_id, conflict_check_id, search_term_id, matched_source, matched_id,
    matched_display_name, match_reason, match_score
  )
  select v_firm_id, v_check_id, term.id, 'contact', c.id, c.display_name,
    'Exact normalized name matches an existing contact', 100
  from public.conflict_search_terms term
  join public.contacts c
    on c.firm_id = v_firm_id
   and public.normalize_conflict_name(c.display_name) = term.normalized_name
  where term.conflict_check_id = v_check_id
  union all
  select v_firm_id, v_check_id, term.id, 'contact_alias', ca.id, c.display_name,
    'Exact normalized name matches an existing contact alias: ' || ca.alias, 100
  from public.conflict_search_terms term
  join public.contact_aliases ca
    on ca.firm_id = v_firm_id
   and public.normalize_conflict_name(ca.alias) = term.normalized_name
  join public.contacts c on c.id = ca.contact_id and c.firm_id = ca.firm_id
  where term.conflict_check_id = v_check_id
  union all
  select v_firm_id, v_check_id, term.id, 'prior_intake', prior.id, prior.display_name,
    'Exact normalized name appears in a prior intake', 95
  from public.conflict_search_terms term
  join public.intake_parties prior
    on prior.firm_id = v_firm_id
   and prior.intake_id <> p_intake_id
   and prior.normalized_name = term.normalized_name
  where term.conflict_check_id = v_check_id
  union all
  select v_firm_id, v_check_id, term.id, 'matter_party', mp.id, c.display_name,
    'Exact normalized name appears as a party in an existing matter', 100
  from public.conflict_search_terms term
  join public.contacts c
    on c.firm_id = v_firm_id
   and public.normalize_conflict_name(c.display_name) = term.normalized_name
  join public.matter_parties mp on mp.contact_id = c.id and mp.firm_id = c.firm_id
  where term.conflict_check_id = v_check_id;

  update public.conflict_checks
  set status = 'review_required', completed_at = now()
  where id = v_check_id;

  update public.intakes
  set status = 'conflict_review', row_version = row_version + 1
  where id = p_intake_id;

  update public.inquiries i
  set status = 'conflict_check'
  from public.intakes intake
  where intake.id = p_intake_id and i.id = intake.inquiry_id;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id, auth.uid(), 'conflict.search_completed', 'conflict_checks', v_check_id,
    jsonb_build_object(
      'intake_id', p_intake_id,
      'search_version', v_version,
      'candidate_count', (select count(*) from public.conflict_candidates where conflict_check_id = v_check_id)
    )
  );

  return v_check_id;
end;
$$;

create or replace function public.review_conflict_candidate(
  p_candidate_id uuid,
  p_review_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
begin
  select firm_id into v_firm_id from public.conflict_candidates where id = p_candidate_id;
  if v_firm_id is null or not public.has_firm_role(
    v_firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate']::public.membership_role[]
  ) then
    raise exception 'Candidate not available';
  end if;
  if p_review_status not in ('not_relevant', 'potential', 'confirmed', 'needs_more_information')
     or char_length(trim(p_reason)) < 5 then
    raise exception 'A review disposition and reason are required';
  end if;

  update public.conflict_candidates
  set review_status = p_review_status,
      reviewer_reason = trim(p_reason),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_candidate_id;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id, metadata)
  values (
    v_firm_id, auth.uid(), 'conflict.candidate_reviewed', 'conflict_candidates', p_candidate_id,
    jsonb_build_object('review_status', p_review_status)
  );
end;
$$;

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
  if p_scheduled_start is null or p_scheduled_end <= p_scheduled_start then
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
  if v_disposition not in ('cleared', 'conditional') then
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

create or replace function public.prevent_conflict_decision_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Conflict decisions are append-only';
end;
$$;

drop trigger if exists conflict_decisions_immutable on public.conflict_decisions;
create trigger conflict_decisions_immutable
before update or delete on public.conflict_decisions
for each row execute function public.prevent_conflict_decision_mutation();

-- All legal workflow writes go through the controlled functions above.
drop policy if exists inquiries_update_intake_team on public.inquiries;
drop policy if exists consultations_update_team on public.consultation_requests;
revoke update on public.inquiries from authenticated;
revoke update on public.consultation_requests from authenticated;
revoke all on public.public_submission_rate_limits from anon, authenticated;
revoke insert, update, delete on public.intakes from authenticated;
revoke insert, update, delete on public.intake_parties from authenticated;
revoke insert, update, delete on public.conflict_checks from authenticated;
revoke insert, update, delete on public.conflict_search_terms from authenticated;
revoke insert, update, delete on public.conflict_candidates from authenticated;
revoke insert, update, delete on public.conflict_decisions from authenticated;

grant select on public.intakes, public.intake_parties, public.conflict_checks,
  public.conflict_search_terms, public.conflict_candidates, public.conflict_decisions
  to authenticated;

revoke all on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean, text) from public;
revoke all on function public.create_intake_from_inquiry(uuid, text, text, text) from public;
revoke all on function public.add_intake_party(uuid, text, text, text, boolean, text[], text) from public;
revoke all on function public.run_conflict_check(uuid) from public;
revoke all on function public.review_conflict_candidate(uuid, text, text) from public;
revoke all on function public.record_conflict_decision(uuid, text, text, text) from public;
revoke all on function public.schedule_cleared_consultation(uuid, uuid, uuid, timestamptz, timestamptz) from public;

grant execute on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean, text) to anon, authenticated;
grant execute on function public.create_intake_from_inquiry(uuid, text, text, text) to authenticated;
grant execute on function public.add_intake_party(uuid, text, text, text, boolean, text[], text) to authenticated;
grant execute on function public.run_conflict_check(uuid) to authenticated;
grant execute on function public.review_conflict_candidate(uuid, text, text) to authenticated;
grant execute on function public.record_conflict_decision(uuid, text, text, text) to authenticated;
grant execute on function public.schedule_cleared_consultation(uuid, uuid, uuid, timestamptz, timestamptz) to authenticated;

comment on table public.intakes is 'Structured prospective-client intake linked to immutable public inquiry submission.';
comment on table public.conflict_decisions is 'Append-only lawyer decisions. Never update or delete a prior legal decision.';
comment on function public.schedule_cleared_consultation(uuid, uuid, uuid, timestamptz, timestamptz)
  is 'Schedules only after lawyer conflict clearance and rejects lawyer overlap.';
