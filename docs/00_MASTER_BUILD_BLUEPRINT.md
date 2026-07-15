# Master Build Blueprint

## 1. Mission

Build a secure, premium law-office operating system for **Batalla & Associates, Law & Business Offices**. The product combines a controlled public website, prospective-client intake, internal legal operations, document and evidence management, client collaboration, billing, reporting and carefully governed AI assistance.

The system must reduce missed deadlines, lost instructions, duplicate records, uncontrolled document sharing, billing leakage and uncertainty over who changed what.

## 2. Product boundaries

### In scope

- Public firm website and verified content management.
- Inquiries, consultation requests and prospective-client intake.
- Conflict checking and engagement decisions.
- Contacts, organizations, aliases and relationships.
- Matters, parties, teams, chronology, notes, tasks, deadlines and events.
- Private document/evidence vault, versions, sharing and templates.
- Client portal and secure messages.
- Time, expenses, retainers, invoices, receipts and reconciliation.
- Audit, security, reports, backups and operational administration.
- Matter-scoped AI assistance after security foundations are complete.

### Out of scope

- Public lawyer marketplace.
- Automated legal advice to the public.
- Court filing automation without a lawyer-controlled external integration and explicit approval.
- Autonomous sending, signing, filing, settlement commitment or legal conclusion.
- Custody of client trust funds unless separately designed and legally reviewed.
- eMango, consumer wallet, barangay, health, employment or permit modules.

## 3. Users

- `firm_admin`: technical and operational administrator; no automatic right to privileged matter content unless granted matter access or acting under an approved emergency-access procedure.
- `managing_partner`: firm-wide legal management and approval authority.
- `partner`: legal management authority with broad matter access as approved by policy.
- `associate`: lawyer assigned to matters.
- `paralegal`: contributor on assigned matters.
- `legal_secretary`: intake, calendar, task and document support within assigned access.
- `billing`: financial operations; sees only billing-relevant matter metadata and authorized documents.
- `external_collaborator`: time-limited, explicit matter access.
- `client_user`: portal-only access to explicitly shared objects; implemented as a separate portal membership model.

## 4. Operating defaults

These defaults are approved until replaced in the decision register:

- Initial deployment supports one firm but every tenant-owned row carries `firm_id` and RLS remains multi-tenant safe.
- Primary timezone: `Asia/Manila`.
- Currency: `PHP` with decimal arithmetic; never JavaScript floating-point for authoritative totals.
- Database timestamps: UTC `timestamptz`; UI renders in the firm timezone.
- User-facing dates: unambiguous day-month-year with month name; exports use ISO 8601.
- Legal records use archive/void/supersede states instead of hard deletion.
- Document versions are immutable after upload.
- Highly restricted matters use explicit allowlists; firm role alone is insufficient.
- Client portal receives explicit shares only; no inheritance from broad firm access.
- AI is disabled for live client content until the AI release gate is approved.
- Payments begin with authorized manual reconciliation; no payment provider is assumed.
- Public content is draft until approved by an authorized lawyer and recorded in the verified-content register.

## 5. Core modules

1. Public Website and CMS
2. Identity, Memberships and Access
3. Intake and Consultation
4. Conflict Checking
5. Contacts and Organizations
6. Matters and Legal Workspaces
7. Tasks, Deadlines and Calendar
8. Documents, Evidence and Templates
9. Communications and Client Portal
10. Time, Expenses and Billing
11. Reports and Management
12. Security, Audit and Administration
13. Controlled AI

## 6. Product principles

- **Confidential by construction:** access is denied unless explicitly allowed.
- **Matter-scoped:** legal work is organized around matters, not loose files.
- **Auditable:** sensitive actions produce immutable, searchable audit events.
- **No silent loss:** concurrent edits use version checks; conflicts are surfaced.
- **No fake completion:** empty screens, schemas without workflows and UI-only permissions are not features.
- **Verified public truth:** no invented credentials, practice claims, results or testimonials.
- **Human legal judgment:** software assists; lawyers approve legal decisions and outputs.
- **Operational clarity:** every queue has an owner, status, SLA target and next action.

## 7. Success metrics

- No unauthorized cross-firm or cross-matter access in automated RLS/storage tests.
- Every active matter has a responsible lawyer and visible next action.
- Every deadline has an owner, source, confirmation state and change history.
- Every final/executed document has immutable version metadata and integrity hash.
- Every intake is resolved into declined, closed or approved/converted states.
- Every invoice total is reproducible from approved time and expense records.
- Every privileged export is approved, logged and time-bounded.
- Backup restoration succeeds in a scheduled drill before live client-document launch.

## 8. Content truth and launch blockers

The supplied research plan states that professional credentials, exact public profile details, practice areas, fees, testimonials and final legal notices must be verified. The internal system can be built without these assets, but the public launch may not publish placeholders as fact.

The CMS must support `draft`, `review`, `approved`, `published` and `archived` lifecycle states, an approver, approval timestamp, source document and expiry/review date.
