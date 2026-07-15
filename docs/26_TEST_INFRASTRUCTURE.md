# Test Infrastructure — EPIC-001

## Purpose

This epic establishes executable regression gates before legal operations are expanded. All fixtures are synthetic. No real client, prospect, attorney-client communication, credential or production database export may be used.

## Commands

```bash
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
npm run test:e2e:install
npm run test:e2e
npm run supabase:start
npm run test:db
npm run supabase:stop
npm run check:local
```

`npm run test:db` requires Docker because the Supabase CLI starts a local PostgreSQL/Auth/Storage stack.

## Current executable coverage

- `tests/unit/public-forms.test.ts` — Zod validation and normalization.
- `tests/components/InquiryForm.test.tsx` — browser-facing inquiry form submission and non-engagement acknowledgment.
- `tests/integration/public-inquiry-route.test.ts` — server route validation, honeypot handling, RPC contract and safe public errors.
- `tests/e2e/public-site.spec.ts` — public-site smoke path and engagement disclaimer.
- `supabase/tests/001_rls_isolation.test.sql` — firm and matter isolation using pgtap.

## RLS mutation protection

The database test asserts exact row counts for two synthetic firms and an unassigned restricted matter. Weakening the tested `firms`, `inquiries`, `contacts` or `matters` policies to allow broad reads causes those assertions to return extra rows and fail `supabase test db`, which fails the GitHub database job.

Any new sensitive table must add positive and negative RLS tests in the same pull request. A table is not complete merely because RLS is enabled.

## CI jobs

Every pull request and push to `main` runs:

1. lint, strict TypeScript, Vitest and production build;
2. local Supabase migrations plus pgtap RLS tests;
3. Playwright public smoke test.

A failure in any job blocks completion of the epic or feature.

## Local limitation reporting

When Docker or browser binaries are unavailable, the developer must report the unexecuted gate explicitly. Never replace an unavailable security test with a fake passing script.
