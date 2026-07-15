# BatallaOS Dependency-Ordered Implementation Roadmap

Agents must implement in this order unless a recorded decision changes dependencies. Each epic is delivered through focused PRs; no “build the whole app” mega-PR.

The roadmap implements `27_BATALLA_OS_MASTER_ARCHITECTURE.md`. The public website is one BatallaOS surface; the Case Management Core, paper/digital reconciliation and role-specific workspaces govern the operational design.

## Release 0 — Repository, identity and security foundation

### EPIC-000 Documentation and truth baseline — complete

- Master blueprint, requirements, workflows, permissions, data model, screens, tests, roadmap and definition of done.
- BatallaOS product architecture and operating philosophy are binding.

### EPIC-001 Test infrastructure — complete

- Vitest/RTL, Playwright and Supabase local pgtap harness installed.
- CI runs locked install, lint, strict TypeScript, unit tests, production build, RLS and browser smoke tests.
- All three GitHub CI jobs passed.
- Production Vercel deployment from `main` passed and returned HTTP 200.

### EPIC-002 Auth, MFA and staff membership hardening — active

- Invitation, activation, expiry/revocation, AAL2, office positions, role changes, suspension, offboarding and session revocation.
- Staff-management UI uses office language, not generic user-management language.
- Acceptance: role changes, suspension and revocation are server-enforced and RLS-tested; no client-side-only authorization.

### EPIC-003 Audit and request correlation

- Stable audit event service, request IDs, redacted diffs and audit viewer foundation.
- Authentication, role, export and emergency-access events become searchable and printable.

## Release 1 — Business growth, intake and legal core

### EPIC-004 Verified public content, SEO and campaign capture

- Verified Atty. Batalla, Dan Tejada, team, practice area, article, FAQ, community, news and contact content workflows.
- Search metadata, social campaign landing parameters, consent and source capture.
- No public claim without verified source and approval.

### EPIC-005 Marketing attribution and conversion analytics

- Source, campaign, referral, first/last touch, inquiry, consultation, engagement and collected-revenue attribution.
- Printable conversion report with visible definitions and limitations.

### EPIC-010 Contact/organization CRM

- Full CRUD, aliases, contact methods, addresses, family/business relationships, duplicate detection and controlled merge.

### EPIC-011 Structured intake

- Inquiry conversion, intake detail, parties, urgency, missing information, preferred contact, source and ownership.

### EPIC-012 Conflict checking

- Search terms, aliases, related persons/organizations, candidates, review and append-only lawyer decisions.

### EPIC-013 Consultation, engagement and matter opening

- Consultation preparation and notes, engagement record, opening checklist, atomic conversion and matter numbering.

### EPIC-014 Case Management Core and matter workspace

- Overview, parties, team/access, court, branch, judge, chronology, notes, status history and next action.
- All downstream operational records connect to the matter where applicable.

### EPIC-015 Tasks, recommendations and optimistic concurrency

- Task CRUD, assignments, reviewer, dependencies, revision, completion evidence and lawyer recommendations.

### EPIC-016 Physical folder tracking

- QR label, cabinet/drawer, current holder, check-out/check-in, movement reason, custody history and exception state.
- QR scanning requires confirmation and never silently transfers custody.

### EPIC-017 Executive Command Center foundation

- Atty. Batalla’s role home answers decisions, hearings, deadlines, waiting clients, Dan’s recommendations, urgent items, weekly inquiries and office-control state.
- Large-text, plain-language, source-linked and printable; no widget wall.

## Release 2 — Hearings, deadlines, documents and printing

### EPIC-020 Events, hearings, deadlines and reminders

- Confirmed deadline model, hearing preparation/outcome, revisions, in-app notifications and escalation.

### EPIC-021 Office calendar and integration foundation

- BatallaOS office calendar is authoritative for hearings, consultations, meetings, deadlines, seminars and selected staff events.
- Provider abstraction and one approved external synchronization provider after review.

### EPIC-022 Private document vault

- Scan/upload session, quarantine, validation, OCR, versioning, signed download, metadata and search UI.

### EPIC-023 Document review, templates and generation

- Status approval, template versions, generation jobs and PDF output.

### EPIC-024 Evidence and chain of custody

- Evidence items, original integrity, custody events and export log.

### EPIC-025 E-signature integration

- Only after provider decision and security review.

### EPIC-026 Printing, packets and paper reconciliation

- Executive daily sheet, hearing packet, review packet, matter summary, chronology, folder cover/QR label, instructions, evidence list, billing forms and reports.
- No ordinary packet requires external PDF editing.
- Physical and digital records expose a reconciliation state.

## Release 3 — Client collaboration

### EPIC-030 Portal identity and invitations

- Portal user model, terms, invitation, expiry, revocation and RLS tests.

### EPIC-031 Explicit portal sharing

- Matter summaries, timeline entries, document-version shares and acknowledgments.

### EPIC-032 Secure messaging and client requests

- Portal-visible threads, immutable messages, quarantined uploads and requests.

### EPIC-033 Portal appointments

- Shared consultations/events and confirmation/cancellation history.

### EPIC-034 Portal payments and receipts view

- Read-only authorized balances, issued invoices, recorded payments and receipts; no internal billing notes.

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

- Workload, hearings, deadlines, intake, marketing, billing, folder custody and security reports with visible definitions, permissions and print forms.

## Release 5 — Institutional knowledge and controlled intelligence

### EPIC-046 Internal Knowledge

- Court procedures, judges/branches, agencies, strategies, templates, checklists, SOPs, research and common-mistake prevention.
- Entries require author, source, scope, confidence, permissions and review date.

### EPIC-047 Office Memory

- Attributable, reviewable and supersedable practical lessons that may suggest future checklist items without changing legal records automatically.

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
- AI never files, sends, signs, approves, deletes or replaces lawyer judgment.

### EPIC-055 Voice dictation and advanced assistance

- Controlled dictation, document comparison, missing-document review, smart checklist suggestions and deadline-verification support.

## Release 6 — Reputation and production readiness

### EPIC-060 Public content verification and launch

- Approved logo, attorney profiles, office/contact details, practice areas, legal notices, articles and launch checklist.

### EPIC-061 Data migration/import tooling

- Only after source data inventory and mapping approval.

### EPIC-062 Backup restore, penetration test and incident drill

- Must pass before live client-document cutover.

### EPIC-063 Production cutover

- Supabase/Vercel configuration, administrator onboarding, monitoring, training, paper/digital reconciliation procedures and rollback plan.

### EPIC-064 Reputation archive

- Verified professional timeline, awards, media, interviews, seminars, publications, leadership, speaking, community work and public-service history.

## Epic execution template

Every epic must document:

- objective and requirement IDs;
- BatallaOS module and role experience affected;
- dependencies;
- schema/migration changes;
- routes/components/actions;
- permissions and RLS;
- audit events;
- tests and fixtures;
- data migration/backfill;
- security/privacy impact;
- print behavior and paper/digital reconciliation where relevant;
- rollout/rollback;
- screenshots with synthetic data;
- unresolved risks.