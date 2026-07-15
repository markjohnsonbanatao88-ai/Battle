# Dependency-Ordered Implementation Roadmap

Agents must implement in this order unless a recorded decision changes dependencies. Each epic is delivered through focused PRs; no “build the whole app” mega-PR.

## Release 0 — Repository and quality foundation

### EPIC-000 Documentation and truth baseline — complete in this package

- Master blueprint, requirements, workflows, permissions, data model, screens, tests, roadmap and definition of done.

### EPIC-001 Test infrastructure — implemented, external CI verification pending

- Vitest/RTL, Playwright and Supabase local pgtap harness are installed.
- CI runs unit, build, RLS and browser smoke tests.
- Local unit/component/server tests and production build pass.
- Docker-backed RLS and Playwright browser execution must pass in GitHub CI before EPIC-001 is marked fully complete and EPIC-002 begins.
- The isolation suite is mutation-sensitive: weakening tested read policies exposes extra synthetic rows and fails the expected-count assertions.

### EPIC-002 Auth, MFA and membership hardening

- Invitation, activation, AAL2, role changes, suspension, offboarding and session revocation.
- Acceptance: role changes and revocation tested; no client-side-only authorization.

### EPIC-003 Audit and request correlation

- Stable audit event service, request IDs, redacted diffs and audit viewer foundation.

## Release 1 — Intake and legal core

### EPIC-010 Contact/organization CRM

- Full CRUD, aliases, contact methods, addresses, relationships, duplicate detection and merge.

### EPIC-011 Structured intake

- Inquiry conversion, intake detail, parties, urgency, missing information and ownership.

### EPIC-012 Conflict checking

- Search terms, candidates, review and append-only lawyer decisions.

### EPIC-013 Engagement and matter opening

- Engagement record, opening checklist, atomic conversion and matter numbering.

### EPIC-014 Matter workspace

- Overview, parties, team/access, chronology, notes and status history.

### EPIC-015 Tasks and optimistic concurrency

- Task CRUD, assignments, reviewer, dependencies, revision and completion evidence.

## Release 2 — Deadlines and documents

### EPIC-020 Events, deadlines and reminders

- Confirmed deadline model, revisions, in-app notifications and escalation.

### EPIC-021 Calendar integration foundation

- Provider abstraction and one approved calendar provider after review.

### EPIC-022 Private document vault

- Upload session, quarantine, validation, versioning, signed download and metadata UI.

### EPIC-023 Document review, templates and generation

- Status approval, template versions, generation jobs and PDF output.

### EPIC-024 Evidence and chain of custody

- Evidence items, original integrity, custody events and export log.

### EPIC-025 E-signature integration

- Only after provider decision and security review.

## Release 3 — Client collaboration

### EPIC-030 Portal identity and invitations

- Portal user model, terms, invitation, expiry, revocation and RLS tests.

### EPIC-031 Explicit portal sharing

- Matter summaries, document version shares and acknowledgments.

### EPIC-032 Secure messaging and client requests

- Portal-visible threads, immutable messages, quarantined uploads and requests.

### EPIC-033 Portal appointments

- Shared consultations/events and confirmation/cancellation history.

## Release 4 — Billing and operations

### EPIC-040 Billing arrangements and rates

- Versioned arrangements/rates and permissions.

### EPIC-041 Time and expenses

- Entry, approval, revisions and receipts.

### EPIC-042 Retainer ledger

- Append-only ledger and reconciliation rules.

### EPIC-043 Invoicing

- Draft/review/issue/void/credit note and immutable issued snapshots.

### EPIC-044 Payments and receipts

- Manual reconciliation first; provider integration separately approved.

### EPIC-045 Reports

- Workload, deadlines, intake, billing and security reports with definitions and permissions.

## Release 5 — Governance and controlled intelligence

### EPIC-050 Retention, legal hold and disposition

- Policy tables, review queue and legal hold enforcement.

### EPIC-051 Export controls and data-subject workflows

- Approved export jobs and privacy request tracking.

### EPIC-052 Operational security

- Incident management, session/device visibility, backup state and integration health.

### EPIC-053 AI infrastructure and policy gate

- Provider abstraction, matter retrieval, source references, audit, kill switch and human review.

### EPIC-054 Approved AI use cases

- One use case at a time, beginning with low-risk internal summarization on synthetic/staging data.

## Release 6 — Production readiness

### EPIC-060 Public content verification and launch

- Approved logo, attorney profile, office/contact details, practice areas and legal notices.

### EPIC-061 Data migration/import tooling

- Only after source data inventory and mapping approval.

### EPIC-062 Backup restore, penetration test and incident drill

- Must pass before live client-document cutover.

### EPIC-063 Production cutover

- Supabase/Vercel configuration, admin onboarding, monitoring, training and rollback plan.

## Epic execution template

Every epic must document:

- objective and requirement IDs;
- dependencies;
- schema/migration changes;
- routes/components/actions;
- permissions and RLS;
- audit events;
- tests and fixtures;
- data migration/backfill;
- security/privacy impact;
- rollout/rollback;
- screenshots with synthetic data;
- unresolved risks.
