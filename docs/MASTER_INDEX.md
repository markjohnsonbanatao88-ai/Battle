# BatallaOS — Master Index

This directory is the binding construction manual for **BatallaOS**, the complete digital operating system for Batalla & Associates. Claude, Codex, and human contributors must treat it as the product and engineering source of truth.

## Authority order

When sources disagree, use this order:

1. Written decisions in `19_DECISION_REGISTER.md` marked **Approved**.
2. Security and privacy controls in `08_SECURITY_PRIVACY_COMPLIANCE.md`.
3. Product identity, operating philosophy, module boundaries and role experience in `27_BATALLA_OS_MASTER_ARCHITECTURE.md`.
4. Product behavior in `03_WORKFLOWS.md`, `04_ROLE_PERMISSION_MATRIX.md`, and `07_SCREEN_SPECIFICATIONS.md`.
5. Data contracts in `05_DATA_MODEL_BLUEPRINT.md` and `06_SERVER_ACTIONS_API_CONTRACTS.md`.
6. Delivery order in `15_IMPLEMENTATION_ROADMAP.md` and `BUILD_MANIFEST.json`.
7. Existing application code and migrations.
8. Older summaries in `PRODUCT_SCOPE.md`, `ARCHITECTURE.md`, and `SECURITY.md`.

Existing code is not allowed to override a documented security requirement or the approved BatallaOS operating philosophy. If code contradicts this manual, open an issue and fix the code.

## Mandatory reading order for Claude

Before proposing work, Claude must read:

1. `PROJECT_STATE.md`
2. `27_BATALLA_OS_MASTER_ARCHITECTURE.md`
3. `00_MASTER_BUILD_BLUEPRINT.md`
4. `19_DECISION_REGISTER.md`
5. `04_ROLE_PERMISSION_MATRIX.md`
6. `03_WORKFLOWS.md`
7. `05_DATA_MODEL_BLUEPRINT.md`
8. `08_SECURITY_PRIVACY_COMPLIANCE.md`
9. `15_IMPLEMENTATION_ROADMAP.md`
10. `16_DEFINITION_OF_DONE.md`
11. `20_AGENT_OPERATING_SYSTEM.md`
12. `22_EPIC_ACCEPTANCE_CRITERIA.md`
13. `23_STATE_MACHINES_AND_NUMBERING.md`

Claude then audits the repository against `21_TRACEABILITY_MATRIX.md` and recommends the next **unblocked** epic only.

## Mandatory reading order for Codex

Before editing, Codex must read:

1. `AGENTS.md`
2. `27_BATALLA_OS_MASTER_ARCHITECTURE.md`
3. The assigned epic in `15_IMPLEMENTATION_ROADMAP.md`
4. The relevant workflow, screen, data, permission, security, and test sections
5. `16_DEFINITION_OF_DONE.md`
6. The current Supabase migrations

Codex must not invent missing policy. It must record unresolved questions in `19_DECISION_REGISTER.md` as **Needs Approval** and implement only approved defaults.

## Documents

| File | Purpose |
|---|---|
| `PROJECT_STATE.md` | Honest implemented-versus-target status |
| `27_BATALLA_OS_MASTER_ARCHITECTURE.md` | Binding product identity, system spine, operating philosophy, modules, role experience and delivery phases |
| `00_MASTER_BUILD_BLUEPRINT.md` | Mission, boundaries, personas and approved operating defaults |
| `01_PRODUCT_REQUIREMENTS.md` | Functional and non-functional requirements with IDs |
| `02_INFORMATION_ARCHITECTURE.md` | Navigation, route families, global search, object hierarchy |
| `03_WORKFLOWS.md` | End-to-end legal-office workflows and state transitions |
| `04_ROLE_PERMISSION_MATRIX.md` | Role and matter-level authorization rules |
| `05_DATA_MODEL_BLUEPRINT.md` | Target PostgreSQL schema and ownership rules |
| `06_SERVER_ACTIONS_API_CONTRACTS.md` | Mutation/query contracts, validation, errors, audit behavior |
| `07_SCREEN_SPECIFICATIONS.md` | Page-by-page requirements and acceptance criteria |
| `08_SECURITY_PRIVACY_COMPLIANCE.md` | Threat model, privacy, data handling, incident and access controls |
| `09_DOCUMENT_EVIDENCE_VAULT.md` | Documents, versions, evidence integrity, sharing, retention |
| `10_CLIENT_PORTAL.md` | Client-facing access and isolation rules |
| `11_BILLING_FINANCIALS.md` | Time, expenses, retainers, invoices, receipts, reconciliation |
| `12_NOTIFICATIONS_CALENDAR.md` | Deadlines, reminders, scheduling, delivery and escalation |
| `13_AI_GOVERNANCE.md` | Controlled AI features, prohibitions, approval and audit |
| `14_TEST_STRATEGY.md` | Unit, integration, RLS, storage, E2E and security testing |
| `15_IMPLEMENTATION_ROADMAP.md` | Dependency-ordered epics and release plan |
| `16_DEFINITION_OF_DONE.md` | Mandatory completion gates; prevents fake completion |
| `17_OPERATIONS_RUNBOOK.md` | Setup, deployments, backups, incidents, offboarding, recovery |
| `18_DESIGN_SYSTEM.md` | Brand, visual language, accessibility and component behavior |
| `19_DECISION_REGISTER.md` | Approved defaults, unresolved business choices, content blockers |
| `20_AGENT_OPERATING_SYSTEM.md` | Claude/Codex/GitHub/Vercel/Supabase working protocol |
| `21_TRACEABILITY_MATRIX.md` | Requirement-to-screen-to-table-to-test mapping |
| `22_EPIC_ACCEPTANCE_CRITERIA.md` | Exact completion conditions for every epic |
| `23_STATE_MACHINES_AND_NUMBERING.md` | Allowed lifecycle transitions and numbering rules |
| `24_CONFIGURATION_CATALOG.md` | Firm-configurable settings and historical snapshot rules |
| `25_RELEASE_CHECKLISTS.md` | PR, staging, module and production launch gates |
| `26_TEST_INFRASTRUCTURE.md` | EPIC-001 commands, fixtures, CI jobs and RLS regression behavior |
| `implementation-reports/EPIC-001.md` | Exact delivery, verification, migration and gate evidence |
| `BUILD_MANIFEST.json` | Machine-readable phases, epics, gates and prohibited shortcuts |

## Global non-negotiables

- BatallaOS is a law-office operating system, not an automated lawyer or public legal-advice service.
- The Case Management Core is the coordination spine for documents, hearings, deadlines, tasks, billing, physical folders, portal sharing, knowledge and reports.
- Every operationally important view must support a printable form.
- Nothing legally important is automatically sent, filed, signed, approved, deleted or decided.
- AI assists; lawyers decide.
- Paper and digital records must reconcile.
- No Firebase, Firestore, Genkit, eMango, BarangayOS, barangay workflows, public document buckets, or client-side authorization.
- No real client data, privileged communications, production logs, tokens, or database dumps in Claude or Codex prompts.
- No feature is complete until its UI, server mutation, validation, RLS, audit event, error states, tests, documentation and role-appropriate print behavior all exist.
- Public claims remain unpublished until verified in writing.