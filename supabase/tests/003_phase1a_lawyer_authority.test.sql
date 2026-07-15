begin;

create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (
  id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '12000000-0000-0000-0000-000000000001',
    'technical.admin.phase1a@example.test', 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Technical Administrator"}'::jsonb, now(), now()
  ),
  (
    '12000000-0000-0000-0000-000000000002',
    'partner.authority.phase1a@example.test', 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Partner Lawyer"}'::jsonb, now(), now()
  );

insert into public.firms (id, name, slug)
values ('22000000-0000-0000-0000-000000000001', 'Authority Test Firm', 'authority-test-firm');

insert into public.firm_memberships (firm_id, user_id, role, status) values
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'firm_admin', 'active'),
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000002', 'partner', 'active');

insert into public.inquiries (
  id, firm_id, full_name, email, preferred_contact, subject, message, consent_at
) values (
  '32000000-0000-0000-0000-000000000001',
  '22000000-0000-0000-0000-000000000001',
  'Authority Test Prospect', 'authority.prospect@example.test', 'email',
  'Authority test inquiry',
  'Synthetic inquiry used only to prove separation of technical and legal authority.', now()
);

insert into public.intakes (
  id, firm_id, inquiry_id, status, urgency, summary, created_by
) values (
  '33000000-0000-0000-0000-000000000001',
  '22000000-0000-0000-0000-000000000001',
  '32000000-0000-0000-0000-000000000001',
  'conflict_review', 'normal',
  'Synthetic authority test intake.',
  '12000000-0000-0000-0000-000000000001'
);

insert into public.conflict_checks (
  id, firm_id, intake_id, status, search_version, input_snapshot, requested_by, completed_at
) values (
  '34000000-0000-0000-0000-000000000001',
  '22000000-0000-0000-0000-000000000001',
  '33000000-0000-0000-0000-000000000001',
  'review_required', 1, '[]'::jsonb,
  '12000000-0000-0000-0000-000000000001', now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select throws_ok(
  $$ select public.record_conflict_decision(
    '33000000-0000-0000-0000-000000000001',
    'cleared',
    'Technical administration must not create a legal clearance decision.',
    null
  ) $$,
  'P0001', 'Intake not available',
  'technical firm administrator cannot record a legal conflict decision'
);

select is(
  (
    select count(*)
    from public.list_active_lawyers_for_scheduling('22000000-0000-0000-0000-000000000001')
    where user_id = '12000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'technical administrator is not listed as an assignable lawyer'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000002', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',
  true
);

select lives_ok(
  $$ select public.record_conflict_decision(
    '33000000-0000-0000-0000-000000000001',
    'cleared',
    'The synthetic partner lawyer reviewed the empty candidate set and cleared it.',
    null
  ) $$,
  'partner lawyer can record the legal conflict decision'
);

select is(
  (
    select count(*)
    from public.list_active_lawyers_for_scheduling('22000000-0000-0000-0000-000000000001')
    where user_id = '12000000-0000-0000-0000-000000000002'
  ),
  1::bigint,
  'partner lawyer is listed for consultation assignment'
);

select * from finish();
rollback;
