-- Phase 1A synthetic staging acceptance seed.
-- NEVER run in production. All identities and records are fictional and use reserved .test addresses.
-- Apply only to a disposable local or staging Supabase project after all migrations.

begin;

insert into auth.users (
  id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '12000000-0000-0000-0000-000000000001',
    'secretary@phase1a.example.test',
    'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Secretary"}'::jsonb,
    now(), now()
  ),
  (
    '12000000-0000-0000-0000-000000000002',
    'technical.admin@phase1a.example.test',
    'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Technical Admin"}'::jsonb,
    now(), now()
  ),
  (
    '12000000-0000-0000-0000-000000000003',
    'associate@phase1a.example.test',
    'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Associate"}'::jsonb,
    now(), now()
  ),
  (
    '12000000-0000-0000-0000-000000000004',
    'partner@phase1a.example.test',
    'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Partner"}'::jsonb,
    now(), now()
  ),
  (
    '12000000-0000-0000-0000-000000000005',
    'other.firm@phase1a.example.test',
    'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Other Firm User"}'::jsonb,
    now(), now()
  )
on conflict (id) do update set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.firms (id, name, slug)
values ('22000000-0000-0000-0000-000000000001', 'Phase 1A Other Synthetic Firm', 'phase1a-other-synthetic-firm')
on conflict (id) do nothing;

insert into public.firm_memberships (firm_id, user_id, role, status) values
  ('00000000-0000-0000-0000-00000000b001', '12000000-0000-0000-0000-000000000001', 'legal_secretary', 'active'),
  ('00000000-0000-0000-0000-00000000b001', '12000000-0000-0000-0000-000000000002', 'firm_admin', 'active'),
  ('00000000-0000-0000-0000-00000000b001', '12000000-0000-0000-0000-000000000003', 'associate', 'active'),
  ('00000000-0000-0000-0000-00000000b001', '12000000-0000-0000-0000-000000000004', 'partner', 'active'),
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000005', 'partner', 'active')
on conflict (firm_id, user_id) do update set
  role = excluded.role,
  status = excluded.status;

insert into public.contacts (
  id, firm_id, contact_type, display_name, email, notes, created_by
) values (
  '42000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000b001',
  'organization',
  'Opposing Holdings',
  'opposing.holdings@phase1a.example.test',
  'Synthetic conflict source for staging acceptance only.',
  '12000000-0000-0000-0000-000000000004'
)
on conflict (id) do nothing;

insert into public.matters (
  id, firm_id, matter_number, title, status, responsible_lawyer_id,
  confidentiality_level, created_by, opened_at
) values (
  '52000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000b001',
  'SYN-P1A-STAGE-001',
  'Synthetic prior matter for conflict acceptance',
  'open',
  '12000000-0000-0000-0000-000000000004',
  'restricted',
  '12000000-0000-0000-0000-000000000004',
  current_date
)
on conflict (id) do nothing;

insert into public.matter_parties (
  id, firm_id, matter_id, contact_id, party_role, is_adverse
) values (
  '53000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000b001',
  '52000000-0000-0000-0000-000000000001',
  '42000000-0000-0000-0000-000000000001',
  'opposing party',
  true
)
on conflict (id) do nothing;

insert into public.inquiries (
  id, firm_id, full_name, email, phone, preferred_contact, subject,
  message, consent_at, source, status
) values (
  '32000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000b001',
  'Synthetic Acceptance Prospect',
  'prospect@phase1a.example.test',
  '+63 900 000 0000',
  'email',
  'Synthetic property and contract concern',
  'This is a fictional staging inquiry. Add Opposing Holdings as the adverse organization to exercise the conflict workflow.',
  now(),
  'staging_acceptance',
  'new'
)
on conflict (id) do nothing;

insert into public.tasks (
  id, firm_id, title, description, status, priority, assigned_to,
  reviewer_id, due_at, created_by
) values (
  '62000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000b001',
  'Synthetic urgent staging task',
  'Used only to verify the Executive Command Center urgent-work count.',
  'open',
  'urgent',
  '12000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000004',
  now() + interval '2 days',
  '12000000-0000-0000-0000-000000000004'
)
on conflict (id) do nothing;

commit;
