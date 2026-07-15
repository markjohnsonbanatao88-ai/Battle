begin;

create extension if not exists pgtap with schema extensions;
select plan(30);

insert into auth.users (
  id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '11000000-0000-0000-0000-000000000001',
    'secretary.phase1a@example.test', 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Secretary"}'::jsonb, now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    'lawyer.phase1a@example.test', 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Lawyer"}'::jsonb, now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000003',
    'other.lawyer.phase1a@example.test', 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Other Firm Lawyer"}'::jsonb, now(), now()
  );

insert into public.firms (id, name, slug) values
  ('21000000-0000-0000-0000-000000000001', 'Phase 1A Synthetic Firm', 'phase1a-synthetic-firm'),
  ('21000000-0000-0000-0000-000000000002', 'Phase 1A Other Firm', 'phase1a-other-firm');

insert into public.firm_memberships (firm_id, user_id, role, status) values
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'legal_secretary', 'active'),
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 'partner', 'active'),
  ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000003', 'partner', 'active');

insert into public.contacts (id, firm_id, contact_type, display_name, created_by) values
  (
    '41000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    'organization', 'Opposing Holdings', '11000000-0000-0000-0000-000000000002'
  );

insert into public.matters (
  id, firm_id, matter_number, title, status, responsible_lawyer_id, created_by
) values (
  '51000000-0000-0000-0000-000000000001',
  '21000000-0000-0000-0000-000000000001',
  'SYN-P1A-001', 'Prior synthetic matter', 'open',
  '11000000-0000-0000-0000-000000000002',
  '11000000-0000-0000-0000-000000000002'
);

insert into public.matter_parties (
  id, firm_id, matter_id, contact_id, party_role, is_adverse
) values (
  '52000000-0000-0000-0000-000000000001',
  '21000000-0000-0000-0000-000000000001',
  '51000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000001',
  'opposing party', true
);

insert into public.inquiries (
  id, firm_id, full_name, email, preferred_contact, subject, message, consent_at
) values
  (
    '31000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    'Synthetic Prospect One', 'prospect.one.phase1a@example.test', 'email',
    'Synthetic property concern',
    'Fictional inquiry content created only for the Phase 1A legal workflow test.', now()
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '21000000-0000-0000-0000-000000000001',
    'Synthetic Prospect Two', 'prospect.two.phase1a@example.test', 'email',
    'Second synthetic concern',
    'Fictional uncleared inquiry content created only for automated testing.', now()
  );

insert into public.consultation_requests (
  id, firm_id, full_name, email, requested_date, requested_time_window,
  consultation_mode, consent_at
) values
  (
    '61000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    'Synthetic Prospect One', 'prospect.one.phase1a@example.test', current_date + 10,
    'Morning', 'office', now()
  ),
  (
    '61000000-0000-0000-0000-000000000002',
    '21000000-0000-0000-0000-000000000001',
    'Synthetic Prospect One', 'prospect.one.phase1a@example.test', current_date + 10,
    'Morning', 'office', now()
  ),
  (
    '61000000-0000-0000-0000-000000000003',
    '21000000-0000-0000-0000-000000000001',
    'Synthetic Prospect Two', 'prospect.two.phase1a@example.test', current_date + 11,
    'Afternoon', 'office', now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

select like(
  (select public_reference from public.inquiries where id = '31000000-0000-0000-0000-000000000001'),
  'INQ-%',
  'public inquiry receives a random office-safe public reference'
);

select like(
  (select internal_reference from public.inquiries where id = '31000000-0000-0000-0000-000000000001'),
  'BAT-I-%',
  'inquiry receives a separate internal office reference'
);

select isnt(
  (select public_reference from public.inquiries where id = '31000000-0000-0000-0000-000000000001'),
  (select internal_reference from public.inquiries where id = '31000000-0000-0000-0000-000000000001'),
  'public and internal references are not the same identifier'
);

select lives_ok(
  $$ select public.create_intake_from_inquiry(
    '31000000-0000-0000-0000-000000000001', 'urgent', 'Synthetic jurisdiction', null
  ) $$,
  'secretary can create a structured intake from an inquiry'
);

select is(
  (
    select count(*) from public.intake_parties ip
    join public.intakes i on i.id = ip.intake_id
    where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
      and ip.party_role = 'prospective_client'
  ),
  1::bigint,
  'intake creation preserves the prospective client as a structured party'
);

select lives_ok(
  $$ select public.add_intake_party(
    (select id from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001'),
    'organization', 'Opposing Holdings', 'opposing party', true,
    array['Opposing Holdings Corporation'], 'Synthetic adverse organization'
  ) $$,
  'secretary can record an opposing organization and alias'
);

select is(
  (select status from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001'),
  'ready_for_conflict_check',
  'party capture advances the intake to conflict-check readiness'
);

select lives_ok(
  $$ select public.run_conflict_check(
    (select id from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001')
  ) $$,
  'secretary can submit the populated intake for conflict searching'
);

select ok(
  (
    select count(*) > 0
    from public.conflict_candidates cc
    join public.conflict_checks c on c.id = cc.conflict_check_id
    join public.intakes i on i.id = c.intake_id
    where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
  ),
  'exact historical contact and matter matches create conflict candidates'
);

select ok(
  (
    select bool_and(char_length(match_reason) > 10)
    from public.conflict_candidates cc
    join public.conflict_checks c on c.id = cc.conflict_check_id
    join public.intakes i on i.id = c.intake_id
    where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
  ),
  'every candidate tells the reviewer why it matched'
);

select throws_ok(
  $$ select public.record_conflict_decision(
    (select id from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001'),
    'cleared', 'Secretary must never make this legal decision.', null
  ) $$,
  'P0001', 'Intake not available',
  'secretary cannot make the lawyer-only conflict decision'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000002', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',
  true
);

select lives_ok(
  $$
  do $review$
  declare
    candidate record;
  begin
    for candidate in
      select cc.id
      from public.conflict_candidates cc
      join public.conflict_checks c on c.id = cc.conflict_check_id
      join public.intakes i on i.id = c.intake_id
      where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
    loop
      perform public.review_conflict_candidate(
        candidate.id, 'not_relevant', 'Reviewed against the synthetic historical record.'
      );
    end loop;
  end
  $review$;
  $$,
  'lawyer can review every generated candidate with a written reason'
);

select is(
  (
    select count(*)
    from public.conflict_candidates cc
    join public.conflict_checks c on c.id = cc.conflict_check_id
    join public.intakes i on i.id = c.intake_id
    where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
      and cc.review_status = 'unreviewed'
  ),
  0::bigint,
  'no candidate remains unreviewed before the overall decision'
);

select lives_ok(
  $$ select public.record_conflict_decision(
    (select id from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001'),
    'cleared', 'Synthetic exact-name candidates were reviewed and found not relevant.', null
  ) $$,
  'authorized lawyer records the append-only overall conflict decision'
);

select is(
  (
    select count(*) from public.conflict_decisions d
    join public.intakes i on i.id = d.intake_id
    where i.inquiry_id = '31000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'one immutable lawyer decision is recorded'
);

select is(
  (select status from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000001'),
  'cleared',
  'lawyer clearance advances the intake to cleared'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

select lives_ok(
  $$ select public.schedule_cleared_consultation(
    '61000000-0000-0000-0000-000000000001',
    '31000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000002',
    (current_date + 10)::timestamptz + interval '9 hours',
    (current_date + 10)::timestamptz + interval '10 hours'
  ) $$,
  'secretary can schedule after an authorized lawyer clears the conflict check'
);

select is(
  (select status::text from public.consultation_requests where id = '61000000-0000-0000-0000-000000000001'),
  'confirmed',
  'cleared consultation becomes confirmed'
);

select throws_ok(
  $$ select public.schedule_cleared_consultation(
    '61000000-0000-0000-0000-000000000002',
    '31000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000002',
    (current_date + 10)::timestamptz + interval '9 hours 30 minutes',
    (current_date + 10)::timestamptz + interval '10 hours 30 minutes'
  ) $$,
  'P0001', 'The assigned lawyer already has an appointment during this time',
  'lawyer double-booking is rejected with an ordinary-language reason'
);

select lives_ok(
  $$ select public.create_intake_from_inquiry(
    '31000000-0000-0000-0000-000000000002', 'normal', null, null
  ) $$,
  'second synthetic inquiry can enter intake'
);

select lives_ok(
  $$ select public.add_intake_party(
    (select id from public.intakes where inquiry_id = '31000000-0000-0000-0000-000000000002'),
    'person', 'Uncleared Opposing Person', 'opposing party', true, '{}', null
  ) $$,
  'second intake can record its adverse party'
);

select throws_ok(
  $$ select public.schedule_cleared_consultation(
    '61000000-0000-0000-0000-000000000003',
    '31000000-0000-0000-0000-000000000002',
    '11000000-0000-0000-0000-000000000002',
    (current_date + 11)::timestamptz + interval '14 hours',
    (current_date + 11)::timestamptz + interval '15 hours'
  ) $$,
  'P0001', 'Conflict clearance is required before scheduling',
  'consultation scheduling cannot bypass conflict clearance'
);

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000003', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}',
  true
);

select throws_ok(
  $$ select public.create_intake_from_inquiry(
    '31000000-0000-0000-0000-000000000001', 'normal', null, null
  ) $$,
  'P0001', 'Inquiry not available',
  'other-firm lawyer cannot operate on the first firm inquiry'
);

select is(
  (select count(*) from public.intakes),
  0::bigint,
  'RLS hides all first-firm intakes from the other firm lawyer'
);

reset role;

do $$
begin
  for counter in 1..5 loop
    perform public.submit_public_inquiry(
      'phase1a-other-firm', 'Rate Test Person', 'rate.test@example.test', null,
      'email', 'Rate-limit test', 'Synthetic inquiry created solely to test durable rate limiting.',
      true, repeat('a', 64)
    );
  end loop;
end;
$$;

select is(
  public.submit_public_inquiry(
    'phase1a-other-firm', 'Rate Test Person', 'rate.test@example.test', null,
    'email', 'Rate-limit test', 'Synthetic inquiry created solely to test durable rate limiting.',
    true, repeat('a', 64)
  ) ->> 'rateLimited',
  'true',
  'sixth public submission in the hour is rate-limited without creating an inquiry'
);

select is(
  (
    select attempt_count from public.public_submission_rate_limits
    where firm_id = '21000000-0000-0000-0000-000000000002'
      and fingerprint_hash = repeat('a', 64)
  ),
  6,
  'rate-limit counter persists instead of rolling back'
);

select is(
  (
    select count(*) from public.inquiries
    where firm_id = '21000000-0000-0000-0000-000000000002'
      and email = 'rate.test@example.test'
  ),
  5::bigint,
  'rate-limited attempt does not create a sixth inquiry record'
);

select throws_ok(
  $$ update public.conflict_decisions set reasoning = 'Changed reasoning is forbidden' $$,
  'P0001', 'Conflict decisions are append-only',
  'even the database owner cannot rewrite a prior conflict decision'
);

select throws_ok(
  $$ delete from public.conflict_decisions $$,
  'P0001', 'Conflict decisions are append-only',
  'even the database owner cannot delete a prior conflict decision'
);

select ok(
  exists (
    select 1 from public.audit_events
    where firm_id = '21000000-0000-0000-0000-000000000001'
      and event_type = 'conflict.decision_recorded'
  ),
  'lawyer decision produces an audit event'
);

select * from finish();
rollback;
