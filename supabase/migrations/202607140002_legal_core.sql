-- Phase 2-ready legal core: contacts, matters, permissions, tasks, and private document metadata.

create type public.contact_type as enum ('person', 'organization');
create type public.matter_status as enum ('prospective', 'open', 'on_hold', 'closed', 'archived');
create type public.task_status as enum ('open', 'in_progress', 'blocked', 'completed', 'cancelled');
create type public.task_priority as enum ('low', 'normal', 'high', 'urgent');

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  contact_type public.contact_type not null,
  display_name text not null check (char_length(display_name) between 2 and 240),
  email text,
  phone text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, firm_id)
);

create index contacts_firm_name_idx on public.contacts(firm_id, display_name);

create table public.contact_aliases (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  contact_id uuid not null,
  alias text not null check (char_length(alias) between 2 and 240),
  created_at timestamptz not null default now(),
  unique(contact_id, alias),
  foreign key (contact_id, firm_id) references public.contacts(id, firm_id) on delete cascade
);

create table public.matters (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_number text not null,
  title text not null check (char_length(title) between 2 and 300),
  status public.matter_status not null default 'prospective',
  practice_area text,
  responsible_lawyer_id uuid references auth.users(id) on delete set null,
  opened_at date,
  closed_at date,
  confidentiality_level text not null default 'standard' check (confidentiality_level in ('standard', 'restricted', 'highly_restricted')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(firm_id, matter_number),
  unique(id, firm_id),
  check (closed_at is null or opened_at is null or closed_at >= opened_at)
);

create index matters_firm_status_idx on public.matters(firm_id, status, created_at desc);

create table public.matter_memberships (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_level text not null default 'contributor' check (access_level in ('viewer', 'contributor', 'manager')),
  created_at timestamptz not null default now(),
  unique(matter_id, user_id),
  foreign key (matter_id, firm_id) references public.matters(id, firm_id) on delete cascade
);

create table public.matter_parties (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null,
  contact_id uuid not null,
  party_role text not null check (char_length(party_role) between 2 and 100),
  is_adverse boolean not null default false,
  created_at timestamptz not null default now(),
  unique(matter_id, contact_id, party_role),
  foreign key (matter_id, firm_id) references public.matters(id, firm_id) on delete cascade,
  foreign key (contact_id, firm_id) references public.contacts(id, firm_id) on delete restrict
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid,
  title text not null check (char_length(title) between 2 and 300),
  description text,
  status public.task_status not null default 'open',
  priority public.task_priority not null default 'normal',
  assigned_to uuid references auth.users(id) on delete set null,
  reviewer_id uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters(id, firm_id) on delete cascade
);

create index tasks_firm_due_idx on public.tasks(firm_id, status, due_at);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null,
  title text not null check (char_length(title) between 1 and 300),
  document_status text not null default 'draft' check (document_status in ('draft', 'review', 'final', 'executed', 'archived')),
  current_version integer not null default 1 check (current_version > 0),
  classification text not null default 'confidential' check (classification in ('internal', 'confidential', 'privileged', 'client_shared')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id, firm_id),
  unique(id, matter_id, firm_id),
  foreign key (matter_id, firm_id) references public.matters(id, firm_id) on delete cascade
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  document_id uuid not null,
  matter_id uuid not null,
  version_number integer not null check (version_number > 0),
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(document_id, version_number),
  unique(storage_path),
  foreign key (document_id, matter_id, firm_id) references public.documents(id, matter_id, firm_id) on delete cascade
);

create trigger contacts_set_updated_at before update on public.contacts for each row execute function public.set_updated_at();
create trigger matters_set_updated_at before update on public.matters for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();

create or replace function public.can_access_matter(p_matter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matters m
    where m.id = p_matter_id
      and public.is_firm_member(m.firm_id)
      and (
        public.has_firm_role(m.firm_id, array['firm_admin', 'managing_partner', 'partner']::public.membership_role[])
        or m.responsible_lawyer_id = auth.uid()
        or exists (
          select 1 from public.matter_memberships mm
          where mm.matter_id = m.id and mm.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_contribute_matter(p_matter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matters m
    where m.id = p_matter_id
      and public.is_firm_member(m.firm_id)
      and (
        public.has_firm_role(m.firm_id, array['firm_admin', 'managing_partner', 'partner']::public.membership_role[])
        or m.responsible_lawyer_id = auth.uid()
        or exists (
          select 1 from public.matter_memberships mm
          where mm.matter_id = m.id
            and mm.user_id = auth.uid()
            and mm.access_level in ('contributor', 'manager')
        )
      )
  );
$$;

create or replace function public.can_manage_matter(p_matter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matters m
    where m.id = p_matter_id
      and public.is_firm_member(m.firm_id)
      and (
        public.has_firm_role(m.firm_id, array['firm_admin', 'managing_partner', 'partner']::public.membership_role[])
        or m.responsible_lawyer_id = auth.uid()
        or exists (
          select 1 from public.matter_memberships mm
          where mm.matter_id = m.id
            and mm.user_id = auth.uid()
            and mm.access_level = 'manager'
        )
      )
  );
$$;

revoke all on function public.can_access_matter(uuid) from public;
revoke all on function public.can_contribute_matter(uuid) from public;
revoke all on function public.can_manage_matter(uuid) from public;
grant execute on function public.can_access_matter(uuid) to authenticated;
grant execute on function public.can_contribute_matter(uuid) to authenticated;
grant execute on function public.can_manage_matter(uuid) to authenticated;

alter table public.contacts enable row level security;
alter table public.contact_aliases enable row level security;
alter table public.matters enable row level security;
alter table public.matter_memberships enable row level security;
alter table public.matter_parties enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;

create policy contacts_internal_select on public.contacts
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary', 'billing']::public.membership_role[]
  )
);

create policy contacts_internal_write on public.contacts
for all to authenticated
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

create policy contact_aliases_internal_select on public.contact_aliases
for select to authenticated
using (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary', 'billing']::public.membership_role[]
  )
);

create policy contact_aliases_internal_write on public.contact_aliases
for all to authenticated
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

create policy matters_select_access on public.matters
for select to authenticated
using (public.can_access_matter(id));

create policy matters_insert_lawyer_team on public.matters
for insert to authenticated
with check (
  public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate']::public.membership_role[]
  )
);

create policy matters_update_manager on public.matters
for update to authenticated
using (public.can_manage_matter(id))
with check (public.can_manage_matter(id));

create policy matter_memberships_select_access on public.matter_memberships
for select to authenticated
using (public.can_access_matter(matter_id));

create policy matter_memberships_manage on public.matter_memberships
for all to authenticated
using (public.can_manage_matter(matter_id))
with check (public.can_manage_matter(matter_id));

create policy matter_parties_select_access on public.matter_parties
for select to authenticated
using (public.can_access_matter(matter_id));

create policy matter_parties_manage on public.matter_parties
for all to authenticated
using (public.can_manage_matter(matter_id))
with check (public.can_manage_matter(matter_id));

create policy tasks_select_access on public.tasks
for select to authenticated
using (
  (matter_id is null and public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary', 'billing']::public.membership_role[]
  ))
  or public.can_access_matter(matter_id)
);

create policy tasks_write_access on public.tasks
for all to authenticated
using (
  (matter_id is null and public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ))
  or public.can_contribute_matter(matter_id)
)
with check (
  (matter_id is null and public.has_firm_role(
    firm_id,
    array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
  ))
  or public.can_contribute_matter(matter_id)
);

create policy documents_select_access on public.documents
for select to authenticated
using (public.can_access_matter(matter_id));

create policy documents_write_access on public.documents
for insert to authenticated
with check (public.can_contribute_matter(matter_id));

create policy documents_update_access on public.documents
for update to authenticated
using (public.can_contribute_matter(matter_id))
with check (public.can_contribute_matter(matter_id));

create policy documents_delete_manager_aal2 on public.documents
for delete to authenticated
using (public.has_aal2() and public.can_manage_matter(matter_id));

create policy document_versions_select_access on public.document_versions
for select to authenticated
using (public.can_access_matter(matter_id));

create policy document_versions_insert_access on public.document_versions
for insert to authenticated
with check (public.can_contribute_matter(matter_id));

-- Version rows are immutable. Corrections create a new version instead of rewriting history.

insert into storage.buckets (id, name, public, file_size_limit)
values ('matter-documents', 'matter-documents', false, 52428800)
on conflict (id) do update set public = false;

create or replace function public.matter_id_from_document_path(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return split_part(p_name, '/', 2)::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.firm_id_from_document_path(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return split_part(p_name, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.can_access_matter_document_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_firm_member(public.firm_id_from_document_path(p_name))
    and exists (
      select 1 from public.matters m
      where m.id = public.matter_id_from_document_path(p_name)
        and m.firm_id = public.firm_id_from_document_path(p_name)
    )
    and public.can_access_matter(public.matter_id_from_document_path(p_name));
$$;

create or replace function public.can_contribute_matter_document_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_firm_member(public.firm_id_from_document_path(p_name))
    and exists (
      select 1 from public.matters m
      where m.id = public.matter_id_from_document_path(p_name)
        and m.firm_id = public.firm_id_from_document_path(p_name)
    )
    and public.can_contribute_matter(public.matter_id_from_document_path(p_name));
$$;

create or replace function public.can_manage_matter_document_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_firm_member(public.firm_id_from_document_path(p_name))
    and exists (
      select 1 from public.matters m
      where m.id = public.matter_id_from_document_path(p_name)
        and m.firm_id = public.firm_id_from_document_path(p_name)
    )
    and public.can_manage_matter(public.matter_id_from_document_path(p_name));
$$;

revoke all on function public.matter_id_from_document_path(text) from public;
revoke all on function public.firm_id_from_document_path(text) from public;
revoke all on function public.can_access_matter_document_path(text) from public;
revoke all on function public.can_contribute_matter_document_path(text) from public;
revoke all on function public.can_manage_matter_document_path(text) from public;
grant execute on function public.matter_id_from_document_path(text) to authenticated;
grant execute on function public.firm_id_from_document_path(text) to authenticated;
grant execute on function public.can_access_matter_document_path(text) to authenticated;
grant execute on function public.can_contribute_matter_document_path(text) to authenticated;
grant execute on function public.can_manage_matter_document_path(text) to authenticated;

create policy matter_documents_select on storage.objects
for select to authenticated
using (bucket_id = 'matter-documents' and public.can_access_matter_document_path(name));

create policy matter_documents_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'matter-documents' and public.can_contribute_matter_document_path(name));

-- Object overwrite is intentionally denied. Upload a new version under a new path.

create policy matter_documents_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'matter-documents'
  and public.has_aal2()
  and public.can_manage_matter_document_path(name)
);

create or replace function public.log_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_firm_id uuid;
  v_entity_id uuid;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_firm_id := nullif(v_row ->> 'firm_id', '')::uuid;
  v_entity_id := nullif(v_row ->> 'id', '')::uuid;

  insert into public.audit_events (firm_id, actor_user_id, event_type, entity_table, entity_id)
  values (v_firm_id, auth.uid(), lower(tg_op), tg_table_name, v_entity_id);

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger audit_inquiries after insert or update or delete on public.inquiries for each row execute function public.log_row_change();
create trigger audit_consultations after insert or update or delete on public.consultation_requests for each row execute function public.log_row_change();
create trigger audit_contacts after insert or update or delete on public.contacts for each row execute function public.log_row_change();
create trigger audit_matters after insert or update or delete on public.matters for each row execute function public.log_row_change();
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.log_row_change();
create trigger audit_documents after insert or update or delete on public.documents for each row execute function public.log_row_change();
