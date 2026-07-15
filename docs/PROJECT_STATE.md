# Project State

**Repository status:** Phase 1 technical foundation with a complete target build specification. EPIC-001 test infrastructure is implemented in code and awaits the first external GitHub CI run for Docker-backed RLS and Playwright browser confirmation.

## Implemented now

- Next.js public website shell and protected dashboard shell.
- Supabase SSR authentication foundation.
- Firm tenancy and membership roles.
- Public inquiry and consultation request submission.
- Basic inquiry and consultation queues.
- Basic CMS table and list screen.
- Initial contact, matter, matter-member, party, task, document, document-version and audit schemas.
- Initial RLS and private matter-document storage policies.
- Explicit Data API grants constrained by RLS.
- Vitest and React Testing Library configuration.
- Unit validation tests, inquiry component test and public inquiry server-route integration tests.
- Playwright public-site smoke test and configuration.
- Supabase local configuration and pgtap firm/matter isolation tests.
- GitHub CI jobs for lint, strict TypeScript, unit tests, production build, local Supabase/RLS tests and Playwright.

## Verification status

Passed in the current execution environment:

- ESLint.
- Strict TypeScript.
- Vitest: 3 files and 8 tests.
- Next.js production build.

Not executable in the current environment and therefore not falsely marked as passed:

- Supabase pgtap/RLS suite, because this environment has no Docker/local PostgreSQL service.
- Playwright browser smoke test, because the browser CDN was not reachable from this environment.

GitHub CI is configured to run both missing gates. EPIC-002 must not begin until those jobs are green or any failures are fixed.

## Present but incomplete

- Contacts: read-only list; no full CRUD, relationships, duplicate merge or conflict search.
- Matters: read-only list; no creation wizard, details workspace, chronology or lifecycle.
- Tasks: read-only list; no mutation, reminders, dependencies or deadline history.
- Documents: schema and policy foundation; no upload/version/download/share UI.
- CMS: list foundation; no approval and publishing workflow.
- Security: policy and test foundation; no complete user, MFA, device, session, export or incident UI.

## Not implemented yet

- Auth invitation, activation, MFA enforcement, suspension, offboarding and session revocation.
- Stable audit/request-correlation service and audit viewer.
- Structured intake and conflict checking.
- Matter workspace and matter-level team administration.
- Hearings, events, deadlines, reminders and calendar integration.
- Document vault, evidence chain, OCR, templates, PDF generation and e-signature.
- Client portal and secure messaging.
- Timekeeping, expenses, retainers, billing, receipts and payment reconciliation.
- Operational reports and controlled production AI.
- Full module-level automated test coverage, backup restoration drill and penetration test.

## Meaning of this repository

The repository contains approved architecture, product behavior, permissions, data design, screen contracts, tests and implementation order for Claude to plan/review and Codex to implement in controlled epics.

It is not a finished production law-office system. Agents must never represent roadmap documentation, schemas, test harnesses or placeholder pages as completed legal-office functionality.
