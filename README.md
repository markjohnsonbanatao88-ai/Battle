# Batalla & Associates Law Office OS

A secure public website and complete target law-office operating system built with Next.js, Supabase, Vercel and GitHub.

## Start here

- [`docs/MASTER_INDEX.md`](docs/MASTER_INDEX.md) — binding source-of-truth order
- [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) — honest current implementation state
- [`docs/00_MASTER_BUILD_BLUEPRINT.md`](docs/00_MASTER_BUILD_BLUEPRINT.md) — full product blueprint
- [`docs/15_IMPLEMENTATION_ROADMAP.md`](docs/15_IMPLEMENTATION_ROADMAP.md) — dependency-ordered build plan
- [`docs/16_DEFINITION_OF_DONE.md`](docs/16_DEFINITION_OF_DONE.md) — prevents placeholder/fake completion
- [`docs/BUILD_MANIFEST.json`](docs/BUILD_MANIFEST.json) — machine-readable release map

## Current state

The repository contains a working Phase 1 foundation and a complete construction specification for the remaining legal operations, portal, financial, governance and controlled-AI modules. Read `docs/PROJECT_STATE.md`; documentation is not represented as completed functionality.

## Stack

- Next.js and React
- Supabase Auth, PostgreSQL, RLS and private Storage
- Vercel deployment
- GitHub source control and CI
- Claude for architecture/security review
- Codex for controlled implementation

## Prohibited regressions

Do not reintroduce Firebase, Firestore, Genkit, eMango, BarangayOS, public legal-document buckets, browser-exposed secrets, real client data in AI development prompts, or build-error suppression.

## Local setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and configure the project URL and publishable key.
3. Apply `supabase/migrations` in order.
4. Create the first Supabase Auth user.
5. Edit and run `supabase/seed.sql` to assign the first `firm_admin` membership.
6. Run:

```bash
npm install
npm run dev
```

## Quality and security gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:rls     # requires Docker/local Supabase
npm run test:e2e     # install Chromium first with npm run test:e2e:install
npm run build
```

See [`docs/26_TEST_INFRASTRUCTURE.md`](docs/26_TEST_INFRASTRUCTURE.md). GitHub CI runs unit tests, local Supabase pgtap isolation tests and the Playwright public smoke journey on every pull request and push to `main`.
