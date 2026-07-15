begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

-- Synthetic identities only.
insert into auth.users (
  id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '11000000-0000-0000-0000-000000000001',
    'managing.one@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Managing Partner"}'::jsonb,
    now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    'admin.one@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Firm Admin"}'::jsonb,
    now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000003',
    'invitee.one@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Invitee"}'::jsonb,
    now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000004',
    'admin.other@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Other Firm Admin"}'::jsonb,
    now(), now()
  );

insert into public.firms (id, name, slug) values
  ('21000000-0000-0000-0000-000000000001', 'Synthetic Membership Firm One', 'synthetic-membership-firm-one'),
  ('21000000-0000-0000-0000-000000000002', 'Synthetic Membership Firm Two', 'synthetic-membership-firm-two');

insert into public.firm_memberships (
  id, firm_id, user_id, role, status, activated_at
) values
  (
    '31000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000001',
    'managing_partner',
    'active',
    now()
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000002',
    'firm_admin',
    'active',
    now()
  ),
  (
    '31000000-0000-0000-0000-000000000004',
    '21000000-0000-0000-0000-000000000002',
    '11000000-0000-0000-0000-000000000004',
    'firm_admin',
    'active',
    now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select ok(
  public.can_manage_firm_memberships('21000000-0000-0000-0000-000000000001'),
  'active managing partner can administer own-firm memberships'
);

select is(
  (select count(*) from public.list_firm_memberships('21000000-0000-0000-0000-000000000001')),
  2::bigint,
  'authorized membership listing returns only the requested firm'
);

create temporary table membership_test_state as
select public.admin_create_membership_invite(
  '21000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000003',
  'associate',
  'Synthetic invitation for automated authorization testing.'
) as target_membership_id;

select ok(
  exists (
    select 1 from public.firm_memberships
    where id = (select target_membership_id from membership_test_state)
      and status = 'invited'
      and role = 'associate'
      and revision = 1
  ),
  'controlled invitation creates an invited membership'
);

select ok(
  exists (
    select 1 from public.audit_events
    where entity_id = (select target_membership_id from membership_test_state)
      and event_type = 'membership.invited'
  ),
  'membership invitation creates an audit event'
);

select throws_ok(
  $$update public.firm_memberships set role = 'partner' where id = '31000000-0000-0000-0000-000000000002'$$,
  '42501',
  'permission denied for table firm_memberships',
  'authenticated clients cannot bypass controlled membership RPCs'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

select throws_ok(
  format(
    'select public.admin_change_membership(%L, %L, null, %L, 1)',
    (select target_membership_id from membership_test_state),
    'activate',
    'Attempt without multi-factor assurance.'
  ),
  'P0001',
  'AAL2 membership administration access denied.',
  'AAL1 session cannot activate a membership'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select lives_ok(
  format(
    'select public.admin_change_membership(%L, %L, null, %L, 1)',
    (select target_membership_id from membership_test_state),
    'activate',
    'Activate the synthetic invited membership.'
  ),
  'AAL2 managing partner can activate an invited membership'
);

select ok(
  exists (
    select 1 from public.audit_events
    where entity_id = (select target_membership_id from membership_test_state)
      and event_type = 'membership.activated'
  ),
  'membership activation creates an audit event'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000002', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal2"}',
  true
);

select throws_ok(
  format(
    'select public.admin_change_membership(%L, %L, %L, %L, 2)',
    (select target_membership_id from membership_test_state),
    'change_role',
    'firm_admin',
    'Attempt privileged role assignment by a firm admin.'
  ),
  'P0001',
  'Only a managing partner may grant a privileged firm role.',
  'firm admin cannot grant a privileged role'
);

select throws_ok(
  $$select public.admin_change_membership(
    '31000000-0000-0000-0000-000000000002',
    'change_role',
    'partner',
    'Attempt self-escalation by a synthetic administrator.',
    1
  )$$,
  'P0001',
  'You cannot create or change your own membership.',
  'administrator cannot change their own role'
);

select throws_ok(
  $$select public.admin_change_membership(
    '31000000-0000-0000-0000-000000000001',
    'disable',
    null,
    'Attempt to remove the only managing partner.',
    1
  )$$,
  'P0001',
  'The firm must retain at least one active managing partner.',
  'last active managing partner cannot be disabled'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000004', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000004","role":"authenticated","aal":"aal2"}',
  true
);

select throws_ok(
  format(
    'select public.admin_change_membership(%L, %L, %L, %L, 2)',
    (select target_membership_id from membership_test_state),
    'change_role',
    'paralegal',
    'Attempt cross-firm membership administration.'
  ),
  'P0001',
  'AAL2 membership administration access denied.',
  'administrator cannot mutate another firm membership'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select throws_ok(
  format(
    'select public.admin_change_membership(%L, %L, %L, %L, 1)',
    (select target_membership_id from membership_test_state),
    'change_role',
    'paralegal',
    'Attempt stale revision mutation.'
  ),
  'P0001',
  'Membership changed since it was loaded. Refresh and review before retrying.',
  'stale membership revision is rejected'
);

select lives_ok(
  format(
    'select public.admin_change_membership(%L, %L, %L, %L, 2)',
    (select target_membership_id from membership_test_state),
    'change_role',
    'paralegal',
    'Approved synthetic role change.'
  ),
  'managing partner can change a non-privileged role'
);

select lives_ok(
  format(
    'select public.admin_change_membership(%L, %L, null, %L, 3)',
    (select target_membership_id from membership_test_state),
    'revoke_sessions',
    'Revoke synthetic sessions after a security review.'
  ),
  'session revocation marker is recorded through controlled RPC'
);

select ok(
  exists (
    select 1 from public.firm_memberships
    where id = (select target_membership_id from membership_test_state)
      and session_revoked_at is not null
      and revision = 4
  ),
  'session revocation updates the membership revision and marker'
);

select lives_ok(
  format(
    'select public.admin_change_membership(%L, %L, null, %L, 4)',
    (select target_membership_id from membership_test_state),
    'offboard',
    'Complete synthetic offboarding and retain history.'
  ),
  'authorized offboarding succeeds without hard deletion'
);

select ok(
  exists (
    select 1 from public.firm_memberships
    where id = (select target_membership_id from membership_test_state)
      and status = 'disabled'
      and offboarded_at is not null
      and revision = 5
  ),
  'offboarding preserves a disabled immutable membership record'
);

select throws_ok(
  format(
    'select public.admin_change_membership(%L, %L, null, %L, 5)',
    (select target_membership_id from membership_test_state),
    'activate',
    'Attempt to reactivate an offboarded membership.'
  ),
  'P0001',
  'An offboarded membership is immutable.',
  'offboarded membership cannot be reactivated'
);

select throws_ok(
  format(
    'delete from public.firm_memberships where id = %L',
    (select target_membership_id from membership_test_state)
  ),
  '42501',
  'permission denied for table firm_memberships',
  'authenticated clients cannot hard-delete membership history'
);

select * from finish();
rollback;
