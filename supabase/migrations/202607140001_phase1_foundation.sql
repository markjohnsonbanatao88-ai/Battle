-- Batalla & Associates Law Office OS
-- Phase 1: firm tenancy, authentication support, public intake, scheduling, CMS, and audit foundation.

create extension if not exists pgcrypto;

create type public.membership_role as enum (
  'firm_admin',
  'managing_partner',
  'partner',
  'associate',
  'paralegal',
  'legal_secretary',
  'billing',
  'external_collaborator'
);

create type public.membership_status as enum ('active', 'invited', 'disabled');
create type public.inquiry_status as enum ('new', 'reviewing', 'conflict_check', 'accepted', 'declined', 'closed');
create type public.consultation_status as enum ('requested', 'confirmed', 'completed', 'cancelled', 'declined');
create type public.content_status as enum ('draft', 'published', 'archived');

create table public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.firm_memberships (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (firm_id, user_id)
);

create index firm_memberships_user_idx on public.firm_memberships(user_id, status);
create index firm_memberships_firm_idx on public.firm_memberships(firm_id, status);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 150),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  preferred_contact text not null check (preferred_contact in ('email', 'phone')),
  subject text not null check (char_length(subject) between 3 and 200),
  message text not null check (char_length(message) between 20 and 5000),
  consent_at timestamptz not null,
  status public.inquiry_status not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, firm_id)
);

create index inquiries_firm_status_idx on public.inquiries(firm_id, status, created_at desc);

create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  inquiry_id uuid,
  full_name text not null check (char_length(full_name) between 2 and 150),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  requested_date date not null,
  requested_time_window text not null check (char_length(requested_time_window) between 2 and 80),
  consultation_mode text not null check (consultation_mode in ('office', 'video', 'phone')),
  notes text check (notes is null or char_length(notes) <= 2000),
  consent_at timestamptz not null,
  status public.consultation_status not null default 'requested',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end is null or scheduled_start is null or scheduled_end > scheduled_start),
  foreign key (inquiry_id, firm_id) references public.inquiries(id, firm_id) on delete set null
);

create index consultation_requests_firm_status_idx on public.consultation_requests(firm_id, status, requested_date);

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  content_key text not null check (content_key ~ '^[a-z0-9_]+$'),
  title text not null check (char_length(title) between 1 and 240),
  body text not null default '',
  status public.content_status not null default 'draft',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (firm_id, content_key)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  firm_id uuid references public.firms(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_firm_created_idx on public.audit_events(firm_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger firms_set_updated_at before update on public.firms for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger memberships_set_updated_at before update on public.firm_memberships for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
create trigger consultations_set_updated_at before update on public.consultation_requests for each row execute function public.set_updated_at();
create trigger site_content_set_updated_at before update on public.site_content for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_firm_member(p_firm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.firm_memberships fm
    where fm.firm_id = p_firm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
  );
$$;

create or replace function public.has_firm_role(p_firm_id uuid, p_roles public.membership_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.firm_memberships fm
    where fm.firm_id = p_firm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
      and fm.role = any(p_roles)
  );
$$;

create or replace function public.has_aal2()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

revoke all on function public.is_firm_member(uuid) from public;
revoke all on function public.has_firm_role(uuid, public.membership_role[]) from public;
grant execute on function public.is_firm_member(uuid) to authenticated;
grant execute on function public.has_firm_role(uuid, public.membership_role[]) to authenticated;
grant execute on function public.has_aal2() to authenticated;

alter table public.firms enable row level security;
alter table public.profiles enable row level security;
alter table public.firm_memberships enable row level security;
alter table public.inquiries enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.site_content enable row level security;
alter table public.audit_events enable row level security;

create policy firms_select_member on public.firms
for select to authenticated
using (public.is_firm_member(id));

create policy profiles_select_self on public.profiles
for select to authenticated
using (id = auth.uid());

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy memberships_select_self_or_admin on public.firm_memberships
for select to authenticated
using (
  user_id = auth.uid()
  or public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

create policy memberships_insert_admin_aal2 on public.firm_memberships
for insert to authenticated
with check (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

create policy memberships_update_admin_aal2 on public.firm_memberships
for update to authenticated
using (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
)
with check (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

create policy inquiries_select_member on public.inquiries
for select to authenticated
using (public.is_firm_member(firm_id));

create policy inquiries_update_intake_team on public.inquiries
for update to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
)
with check (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy consultations_select_member on public.consultation_requests
for select to authenticated
using (public.is_firm_member(firm_id));

create policy consultations_update_team on public.consultation_requests
for update to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
)
with check (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  )
);

create policy site_content_public_published on public.site_content
for select to anon, authenticated
using (status = 'published' or public.is_firm_member(firm_id));

create policy site_content_admin_insert on public.site_content
for insert to authenticated
with check (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

create policy site_content_admin_update on public.site_content
for update to authenticated
using (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
)
with check (
  public.has_aal2()
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

create policy audit_select_admin on public.audit_events
for select to authenticated
using (
  firm_id is not null
  and public.has_firm_role(firm_id, array['firm_admin', 'managing_partner']::public.membership_role[])
);

-- No direct UPDATE or DELETE policies are created for audit_events.

create or replace function public.submit_public_inquiry(
  p_firm_slug text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_preferred_contact text,
  p_subject text,
  p_message text,
  p_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_id uuid;
begin
  if p_consent is not true then
    raise exception 'Consent is required';
  end if;

  if char_length(trim(p_full_name)) not between 2 and 150
     or char_length(trim(p_email)) > 254
     or char_length(trim(p_subject)) not between 3 and 200
     or char_length(trim(p_message)) not between 20 and 5000
     or p_preferred_contact not in ('email', 'phone') then
    raise exception 'Invalid inquiry';
  end if;

  select id into v_firm_id from public.firms where slug = p_firm_slug and status = 'active';
  if v_firm_id is null then
    raise exception 'Firm not found';
  end if;

  insert into public.inquiries (
    firm_id, full_name, email, phone, preferred_contact, subject, message, consent_at
  ) values (
    v_firm_id, trim(p_full_name), lower(trim(p_email)), nullif(trim(p_phone), ''),
    p_preferred_contact, trim(p_subject), trim(p_message), now()
  ) returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.submit_public_consultation(
  p_firm_slug text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_requested_date date,
  p_requested_time_window text,
  p_consultation_mode text,
  p_notes text,
  p_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm_id uuid;
  v_id uuid;
begin
  if p_consent is not true then
    raise exception 'Consent is required';
  end if;

  if p_requested_date < current_date
     or p_consultation_mode not in ('office', 'video', 'phone')
     or char_length(trim(p_full_name)) not between 2 and 150
     or char_length(trim(p_requested_time_window)) not between 2 and 80 then
    raise exception 'Invalid consultation request';
  end if;

  select id into v_firm_id from public.firms where slug = p_firm_slug and status = 'active';
  if v_firm_id is null then
    raise exception 'Firm not found';
  end if;

  insert into public.consultation_requests (
    firm_id, full_name, email, phone, requested_date, requested_time_window,
    consultation_mode, notes, consent_at
  ) values (
    v_firm_id, trim(p_full_name), lower(trim(p_email)), nullif(trim(p_phone), ''),
    p_requested_date, trim(p_requested_time_window), p_consultation_mode,
    nullif(trim(p_notes), ''), now()
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean) from public;
revoke all on function public.submit_public_consultation(text, text, text, text, date, text, text, text, boolean) from public;
grant execute on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.submit_public_consultation(text, text, text, text, date, text, text, text, boolean) to anon, authenticated;

insert into public.firms (id, name, slug)
values ('00000000-0000-0000-0000-00000000b001', 'Batalla & Associates', 'batalla-associates')
on conflict (slug) do nothing;

insert into public.site_content (firm_id, content_key, title, body, status)
values
  ('00000000-0000-0000-0000-00000000b001', 'attorney_profile', 'Attorney profile', 'Awaiting formal verification by the firm.', 'draft'),
  ('00000000-0000-0000-0000-00000000b001', 'practice_areas', 'Practice areas', 'Awaiting formal verification and approval by the firm.', 'draft'),
  ('00000000-0000-0000-0000-00000000b001', 'office_contact', 'Office contact details', 'Awaiting formal verification by the firm.', 'draft')
on conflict (firm_id, content_key) do nothing;
