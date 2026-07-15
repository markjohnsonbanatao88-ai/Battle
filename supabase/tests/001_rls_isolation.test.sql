begin;

create extension if not exists pgtap with schema extensions;
select plan(10);

-- Synthetic identities only. These UUIDs and records do not identify real people or matters.
insert into auth.users (
  id,
  email,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '10000000-0000-0000-0000-000000000001',
    'associate.one@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Associate One"}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'partner.two@example.test',
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Partner Two"}'::jsonb,
    now(),
    now()
  );

insert into public.firms (id, name, slug) values
  ('20000000-0000-0000-0000-000000000001', 'Synthetic Firm One', 'synthetic-firm-one'),
  ('20000000-0000-0000-0000-000000000002', 'Synthetic Firm Two', 'synthetic-firm-two');

insert into public.firm_memberships (firm_id, user_id, role, status) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'associate',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'partner',
    'active'
  );

insert into public.inquiries (
  id, firm_id, full_name, email, preferred_contact, subject, message, consent_at
) values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Synthetic Prospect One',
    'prospect.one@example.test',
    'email',
    'Synthetic inquiry one',
    'Fictional inquiry content created only for automated RLS testing.',
    now()
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Synthetic Prospect Two',
    'prospect.two@example.test',
    'email',
    'Synthetic inquiry two',
    'Fictional inquiry content created only for automated RLS testing.',
    now()
  );

insert into public.contacts (id, firm_id, contact_type, display_name) values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'person',
    'Synthetic Contact One'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'person',
    'Synthetic Contact Two'
  );

insert into public.matters (
  id, firm_id, matter_number, title, status, confidentiality_level
) values
  (
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'SYN-2026-001',
    'Assigned synthetic matter',
    'open',
    'restricted'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'SYN-2026-002',
    'Unassigned synthetic matter',
    'open',
    'restricted'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    'SYN-2026-003',
    'Other firm synthetic matter',
    'open',
    'restricted'
  );

insert into public.matter_memberships (firm_id, matter_id, user_id, access_level) values (
  '20000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'contributor'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

select ok(
  public.is_firm_member('20000000-0000-0000-0000-000000000001'),
  'associate is recognized as an active member of their own firm'
);

select ok(
  not public.is_firm_member('20000000-0000-0000-0000-000000000002'),
  'associate is not recognized as a member of another firm'
);

select is(
  (select count(*) from public.firms),
  1::bigint,
  'firm RLS exposes only the authenticated user firm'
);

select is(
  (select count(*) from public.inquiries),
  1::bigint,
  'inquiry RLS blocks cross-firm prospect information'
);

select is(
  (select count(*) from public.contacts),
  1::bigint,
  'contact RLS blocks cross-firm contacts'
);

select is(
  (select count(*) from public.matters),
  1::bigint,
  'associate sees only explicitly assigned matters and no cross-firm matters'
);

select ok(
  exists (
    select 1
    from public.matters
    where id = '50000000-0000-0000-0000-000000000001'
  ),
  'assigned matter is visible'
);

select ok(
  not exists (
    select 1
    from public.matters
    where id = '50000000-0000-0000-0000-000000000002'
  ),
  'same-firm unassigned restricted matter is hidden from an associate'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',
  true
);

select is(
  (select count(*) from public.inquiries),
  1::bigint,
  'second firm member cannot read the first firm inquiry'
);

select is(
  (select count(*) from public.matters),
  1::bigint,
  'partner sees matters only inside their own firm'
);

select * from finish();
rollback;
