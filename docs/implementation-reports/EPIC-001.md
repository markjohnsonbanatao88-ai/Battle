# EPIC-001 Implementation Report — Test Infrastructure

## Status

**Implemented; external CI confirmation required before completion.**

## Requirements

- Epic: EPIC-001
- Primary requirement: NFR-006
- Supporting controls: tenant isolation, matter isolation, synthetic fixtures and honest gate reporting

## Delivered

- Vitest 4 configuration with React Testing Library and jsdom.
- Validation tests for public inquiry and consultation schemas.
- Inquiry component submission test.
- Public inquiry server-route integration tests covering validation, RPC contract, safe database errors and honeypot handling.
- Playwright configuration and public-site smoke journey.
- Supabase CLI local configuration.
- pgtap RLS test with two firms, cross-firm inquiries/contacts, assigned matter access and unassigned restricted matter denial.
- Explicit public-schema Data API grants constrained by RLS.
- GitHub CI jobs for application quality, local Supabase/RLS and Playwright.
- Updated project state, roadmap, definition of done, setup and agent instructions.

## Bug found and repaired

The public-form honeypot was unreachable because the schema required the hidden field to have a maximum length of zero before the route checked it. The schema now permits a bounded hidden value so the route can silently acknowledge suspected bot submissions without creating a Supabase client or database row. A regression test covers the behavior.

## Local evidence

Passed:

```text
npm run lint                    PASS
npm run typecheck               PASS
npm run test:unit               PASS — 3 files, 8 tests
npm run build                   PASS — 25 routes compiled/prerendered
```

Not executable in this sandbox:

```text
npm run test:rls                NOT RUN — Docker/local PostgreSQL unavailable
npm run test:e2e                NOT RUN — browser CDN unavailable; system browser blocked localhost by environment policy
```

These gates are mandatory in GitHub CI. Do not mark EPIC-001 complete or begin EPIC-002 until both jobs pass.

## Security impact

- Cross-firm and matter-assignment boundaries now have executable negative assertions.
- The database no longer relies on implicit Data API grants.
- Fixtures are synthetic and use `.test` email addresses.
- No service-role key, live client data or production database is required.

## Migration

`202607150001_epic001_explicit_privileges.sql` revokes implicit public-table access from `anon` and `authenticated`, then grants only operations that have matching policies. RLS remains authoritative.

## Rollback

Reverting this epic removes the test dependencies, CI jobs, local Supabase configuration, tests and explicit-grant migration. Do not roll back the privilege migration alone after deploying it without first reviewing the prior project grants; doing so can restore undocumented access behavior.

## Next action

Push branch `epic-001/test-infrastructure`, allow all GitHub CI jobs to run, fix any database/browser failure, then mark EPIC-001 complete. EPIC-002 remains blocked until that evidence exists.
