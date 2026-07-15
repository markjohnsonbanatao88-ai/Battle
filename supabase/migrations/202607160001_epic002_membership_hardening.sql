-- EPIC-002: server/database-authoritative membership administration.
-- Direct membership mutation is removed from authenticated clients. All sensitive
-- changes require AAL2 and pass through audited SECURITY DEFINER functions.

begin;

alter table public.firm_memberships
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists activated_at timestamptz,
  add column if not exists disabled_at timestamptz,
  add column if not exists offboarded_at timestamptz,
  add column if not exists session_revoked_at timestamptz,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists last_transition_reason text,
  add column if not exists revision bigint not null default 1;

update public.firm_memberships
set activated_at = coalesce(activated_at, created_at)
where status = 'active';

alter table public.firm_memberships
  drop constraint if exists firm_memberships_revision_positive,
  add constraint firm_memberships_revision_positive check (revision > 0),
  drop constraint if exists firm_memberships_offboarded_is_disabled,
  add constraint firm_memberships_offboarded_is_disabled
    check (offboarded_at is null or status = 'disabled'),
  drop constraint if exists firm_memberships_reason_length,
  add constraint firm_memberships_reason_length
    check (last_transition_reason is null or char_length(trim(last_transition_reason)) between 5 and 1000);

create index if not exists firm_memberships_firm_role_status_idx
  on public.firm_memberships(firm_id, role, status);

create or replace function public.can_manage_firm_memberships(p_firm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.firm_memberships fm
    where fm.firm_id = p_firm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
      and fm.offboarded_at is null
      and fm.role in ('firm_admin', 'managing_partner')
  );
$$;

create or replace function public.list_firm_memberships(p_firm_id uuid)
returns table (
  membership_id uuid,
  user_id uuid,
  email text,
  display_name text,
  role public.membership_role,
  status public.membership_status,
  invited_by uuid,
  activated_at timestamptz,
  disabled_at timestamptz,
  offboarded_at timestamptz,
  session_revoked_at timestamptz,
  last_transition_reason text,
  revision bigint,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.can_manage_firm_memberships(p_firm_id) then
    raise exception 'Membership administration access denied.';
  end if;

  return query
  select
    fm.id,
    fm.user_id,
    au.email::text,
    coalesce(nullif(trim(p.display_name), ''), au.email::text),
    fm.role,
    fm.status,
    fm.invited_by,
    fm.activated_at,
    fm.disabled_at,
    fm.offboarded_at,
    fm.session_revoked_at,
    fm.last_transition_reason,
    fm.revision,
    fm.created_at,
    fm.updated_at
  from public.firm_memberships fm
  join auth.users au on au.id = fm.user_id
  left join public.profiles p on p.id = fm.user_id
  where fm.firm_id = p_firm_id
  order by
    case fm.status when 'active' then 0 when 'invited' then 1 else 2 end,
    coalesce(nullif(trim(p.display_name), ''), au.email::text);
end;
$$;

create or replace function public.admin_create_membership_invite(
  p_firm_id uuid,
  p_user_id uuid,
  p_role public.membership_role,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_actor public.firm_memberships;
  v_membership_id uuid;
begin
  select * into v_actor
  from public.firm_memberships
  where firm_id = p_firm_id
    and user_id = auth.uid()
    and status = 'active'
    and offboarded_at is null;

  if v_actor.id is null
     or v_actor.role not in ('firm_admin', 'managing_partner')
     or not public.has_aal2() then
    raise exception 'AAL2 membership administration access denied.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot create or change your own membership.';
  end if;

  if p_reason is null or char_length(trim(p_reason)) not between 5 and 1000 then
    raise exception 'A written reason between 5 and 1000 characters is required.';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Invited authentication user does not exist.';
  end if;

  if p_role in ('firm_admin', 'managing_partner') and v_actor.role <> 'managing_partner' then
    raise exception 'Only a managing partner may grant a privileged firm role.';
  end if;

  if exists (
    select 1 from public.firm_memberships
    where firm_id = p_firm_id and user_id = p_user_id
  ) then
    raise exception 'A membership already exists for this user and firm.';
  end if;

  insert into public.firm_memberships (
    firm_id,
    user_id,
    role,
    status,
    invited_by,
    updated_by,
    last_transition_reason
  ) values (
    p_firm_id,
    p_user_id,
    p_role,
    'invited',
    auth.uid(),
    auth.uid(),
    trim(p_reason)
  ) returning id into v_membership_id;

  insert into public.audit_events (
    firm_id,
    actor_user_id,
    event_type,
    entity_table,
    entity_id,
    metadata
  ) values (
    p_firm_id,
    auth.uid(),
    'membership.invited',
    'firm_memberships',
    v_membership_id,
    jsonb_build_object(
      'target_user_id', p_user_id,
      'role', p_role,
      'reason', trim(p_reason)
    )
  );

  return v_membership_id;
end;
$$;

create or replace function public.admin_change_membership(
  p_membership_id uuid,
  p_action text,
  p_role public.membership_role,
  p_reason text,
  p_expected_revision bigint
)
returns public.firm_memberships
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_actor public.firm_memberships;
  v_target public.firm_memberships;
  v_event_type text;
  v_old_role public.membership_role;
  v_old_status public.membership_status;
  v_active_managing_partners integer;
begin
  select * into v_target
  from public.firm_memberships
  where id = p_membership_id
  for update;

  if v_target.id is null then
    raise exception 'Membership not found.';
  end if;

  select * into v_actor
  from public.firm_memberships
  where firm_id = v_target.firm_id
    and user_id = auth.uid()
    and status = 'active'
    and offboarded_at is null;

  if v_actor.id is null
     or v_actor.role not in ('firm_admin', 'managing_partner')
     or not public.has_aal2() then
    raise exception 'AAL2 membership administration access denied.';
  end if;

  if v_target.user_id = auth.uid() then
    raise exception 'You cannot create or change your own membership.';
  end if;

  if p_reason is null or char_length(trim(p_reason)) not between 5 and 1000 then
    raise exception 'A written reason between 5 and 1000 characters is required.';
  end if;

  if p_expected_revision is null or v_target.revision <> p_expected_revision then
    raise exception 'Membership changed since it was loaded. Refresh and review before retrying.';
  end if;

  if v_target.offboarded_at is not null then
    raise exception 'An offboarded membership is immutable.';
  end if;

  if p_action not in ('activate', 'change_role', 'disable', 'offboard', 'revoke_sessions') then
    raise exception 'Unsupported membership action.';
  end if;

  if p_action = 'change_role' and p_role is null then
    raise exception 'A role is required for a role change.';
  end if;

  if p_action = 'change_role'
     and p_role in ('firm_admin', 'managing_partner')
     and v_actor.role <> 'managing_partner' then
    raise exception 'Only a managing partner may grant a privileged firm role.';
  end if;

  if v_target.role = 'managing_partner'
     and (
       p_action in ('disable', 'offboard')
       or (p_action = 'change_role' and p_role <> 'managing_partner')
     ) then
    select count(*) into v_active_managing_partners
    from public.firm_memberships
    where firm_id = v_target.firm_id
      and role = 'managing_partner'
      and status = 'active'
      and offboarded_at is null;

    if v_active_managing_partners <= 1 then
      raise exception 'The firm must retain at least one active managing partner.';
    end if;
  end if;

  v_old_role := v_target.role;
  v_old_status := v_target.status;

  if p_action = 'activate' then
    update public.firm_memberships
    set
      status = 'active',
      activated_at = coalesce(activated_at, now()),
      disabled_at = null,
      updated_by = auth.uid(),
      last_transition_reason = trim(p_reason),
      revision = revision + 1
    where id = p_membership_id
    returning * into v_target;
    v_event_type := 'membership.activated';
  elsif p_action = 'change_role' then
    update public.firm_memberships
    set
      role = p_role,
      updated_by = auth.uid(),
      last_transition_reason = trim(p_reason),
      revision = revision + 1
    where id = p_membership_id
    returning * into v_target;
    v_event_type := 'membership.role_changed';
  elsif p_action = 'disable' then
    update public.firm_memberships
    set
      status = 'disabled',
      disabled_at = now(),
      session_revoked_at = now(),
      updated_by = auth.uid(),
      last_transition_reason = trim(p_reason),
      revision = revision + 1
    where id = p_membership_id
    returning * into v_target;
    v_event_type := 'membership.disabled';
  elsif p_action = 'offboard' then
    update public.firm_memberships
    set
      status = 'disabled',
      disabled_at = now(),
      offboarded_at = now(),
      session_revoked_at = now(),
      updated_by = auth.uid(),
      last_transition_reason = trim(p_reason),
      revision = revision + 1
    where id = p_membership_id
    returning * into v_target;
    v_event_type := 'membership.offboarded';
  else
    update public.firm_memberships
    set
      session_revoked_at = now(),
      updated_by = auth.uid(),
      last_transition_reason = trim(p_reason),
      revision = revision + 1
    where id = p_membership_id
    returning * into v_target;
    v_event_type := 'membership.sessions_revoked';
  end if;

  insert into public.audit_events (
    firm_id,
    actor_user_id,
    event_type,
    entity_table,
    entity_id,
    metadata
  ) values (
    v_target.firm_id,
    auth.uid(),
    v_event_type,
    'firm_memberships',
    v_target.id,
    jsonb_build_object(
      'target_user_id', v_target.user_id,
      'action', p_action,
      'old_role', v_old_role,
      'new_role', v_target.role,
      'old_status', v_old_status,
      'new_status', v_target.status,
      'revision', v_target.revision,
      'reason', trim(p_reason)
    )
  );

  return v_target;
end;
$$;

create or replace function public.prevent_firm_membership_delete()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'Firm memberships cannot be hard deleted. Disable or offboard the membership.';
end;
$$;

drop trigger if exists firm_memberships_prevent_delete on public.firm_memberships;
create trigger firm_memberships_prevent_delete
before delete on public.firm_memberships
for each row execute function public.prevent_firm_membership_delete();

-- Membership changes are permitted only through the controlled RPCs above.
drop policy if exists memberships_insert_admin_aal2 on public.firm_memberships;
drop policy if exists memberships_update_admin_aal2 on public.firm_memberships;
revoke insert, update, delete on public.firm_memberships from authenticated;

revoke all on function public.can_manage_firm_memberships(uuid) from public, anon;
revoke all on function public.list_firm_memberships(uuid) from public, anon;
revoke all on function public.admin_create_membership_invite(uuid, uuid, public.membership_role, text) from public, anon;
revoke all on function public.admin_change_membership(uuid, text, public.membership_role, text, bigint) from public, anon;
revoke all on function public.prevent_firm_membership_delete() from public, anon, authenticated;

grant execute on function public.can_manage_firm_memberships(uuid) to authenticated;
grant execute on function public.list_firm_memberships(uuid) to authenticated;
grant execute on function public.admin_create_membership_invite(uuid, uuid, public.membership_role, text) to authenticated;
grant execute on function public.admin_change_membership(uuid, text, public.membership_role, text, bigint) to authenticated;

commit;
