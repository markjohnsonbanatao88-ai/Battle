# BatallaOS — Master Build Blueprint

## 1. Mission

Build **BatallaOS**, the complete digital operating system for **Batalla & Associates, Law & Business Offices**.

BatallaOS combines a controlled public website, marketing attribution, prospective-client intake, conflict screening, consultation, client and matter operations, physical and digital records, hearings, deadlines, tasks, billing, client collaboration, institutional knowledge, reporting, reputation management and carefully governed AI assistance.

The system must reduce missed deadlines, lost instructions, misplaced physical folders, duplicate records, uncontrolled document sharing, billing leakage, forgotten office lessons and uncertainty over who changed what.

`27_BATALLA_OS_MASTER_ARCHITECTURE.md` is the binding product architecture and role-experience standard for this blueprint.

## 2. Product boundaries

### In scope

- Public firm website, verified reputation content and content management.
- Marketing attribution from visitor/inquiry through collected revenue.
- Inquiries, consultation requests and prospective-client intake.
- Conflict checking and engagement decisions.
- Contacts, organizations, aliases and relationships.
- Matters, parties, teams, chronology, notes, tasks, deadlines, hearings and events.
- Physical folder location, custody history and QR-assisted tracking.
- Private document/evidence vault, versions, OCR, sharing, templates, printing and evidence integrity.
- Office calendar and role-specific daily work surfaces.
- Client portal and secure messages.
- Time, expenses, retainers, invoices, receipts and reconciliation.
- Internal knowledge, Office Memory, SOPs and lessons learned.
- Executive Command Center, operational reports and management analytics.
- Audit, security, backups and operational administration.
- Matter-scoped AI assistance after security and governance foundations are complete.

### Out of scope

- Public lawyer marketplace.
- Automated legal advice to the public.
- Autonomous legal decisions, filing, sending, signing, settlement commitment or legal conclusion.
- Court filing automation without a lawyer-controlled external integration and explicit approval.
- Custody of client trust funds unless separately designed and legally reviewed.
- Unverified public credentials, claims, case results or testimonials.
- eMango, consumer wallet, barangay, health, employment or permit modules.

## 3. Users and role experiences

- `firm_admin`: technical and operational administrator; no automatic right to privileged matter content unless granted matter access or acting under an approved emergency-access procedure.
- `managing_partner`: firm-wide legal management and approval authority. Atty. Batalla’s default home is the Executive Command Center.
- `partner`: legal management authority with broad matter access as approved by policy.
- `associate`: lawyer assigned to matters. Dan’s default home emphasizes cases, recommendations, reviews, tasks, knowledge and hearings.
- `paralegal`: contributor on assigned matters.
- `legal_secretary`: intake, calls, calendar, scanning, printing and physical-folder support within assigned access.
- `clerk`: controlled administrative and records work.
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
- Legal and financial records use archive/void/supersede/revoke states instead of hard deletion.
- Document versions are immutable after upload.
- Physical-folder movements are confirmed and append-only; QR scanning alone never silently changes custody.
- Highly restricted matters use explicit allowlists; firm role alone is insufficient.
- Client portal receives explicit shares only; no inheritance from broad firm access.
- AI is disabled for live privileged client content until the AI release gate is approved.
- Payments begin with authorized manual reconciliation; no payment provider is assumed.
- Public content is draft until approved by an authorized lawyer and recorded in the verified-content register.
- Operationally important screens provide a print-ready form.
- Paper and digital records must have an explicit reconciliation state where both exist.

## 5. System spine

```text
Public Website
      ↓
Marketing Attribution
      ↓
Inquiry / Intake
      ↓
Conflict Screening
      ↓
Consultation
      ↓
Client and Engagement
      ↓
Case Management Core
      ├── Documents and Evidence
      ├── Hearings, Events and Deadlines
      ├── Tasks and Reviews
      ├── Office Calendar
      ├── Billing and Payments
      ├── Physical Folder Tracking
      └── Client Portal
      ↓
Internal Knowledge and Office Memory
      ↓
Controlled AI Assistance
      ↓
Executive Command Center, Reports and Reputation
```

Everything revolves around the Case Management Core. Nothing legally significant should live in isolation when it belongs to a matter.

## 6. Core modules

1. Public Website, CMS and Reputation Archive
2. Marketing Attribution and Conversion Analytics
3. Identity, MFA, Staff Memberships and Access
4. Inquiry, Intake and Consultation
5. Conflict Checking and Engagement
6. Contacts, Clients and Organizations
7. Case Management Core and Matter Workspaces
8. Physical Folder Tracking and QR Labels
9. Hearings, Deadlines, Tasks and Office Calendar
10. Documents, Evidence, OCR, Templates and Printing
11. Communications and Client Portal
12. Time, Expenses, Billing, Payments and Receipts
13. Internal Knowledge and Office Memory
14. Executive Command Center and Management Reports
15. Security, Audit, Administration and Recovery
16. Controlled AI

## 7. Product principles

- **Old-school usable:** role-specific plain-language workflows beat generic dashboards.
- **Faster than paper:** common work should require fewer steps than the current paper process.
- **Safer than paper:** access, custody, deadlines, revisions and decisions are traceable.
- **Printable by default:** important daily, case, hearing and financial views have print-ready outputs.
- **Paper-digital reconciliation:** physical folders and digital records agree or visibly show a discrepancy.
- **Confidential by construction:** access is denied unless explicitly allowed.
- **Matter-scoped:** legal work is organized around matters, not loose files.
- **Auditable:** sensitive actions produce immutable, searchable audit events.
- **No silent loss:** concurrent edits use version checks; conflicts are surfaced.
- **No fake completion:** empty screens, schemas without workflows and UI-only permissions are not features.
- **Verified public truth:** no invented credentials, practice claims, results or testimonials.
- **Human legal judgment:** software and AI assist; lawyers approve legal decisions and outputs.
- **Operational clarity:** every queue has an owner, status, SLA target and next action.
- **Nothing consequential is automatic:** no autonomous filing, sending, signing, approval or deletion.

## 8. Executive Command Center standard

Atty. Batalla’s main screen must answer in under two minutes:

- What needs my decision today?
- What hearings and deadlines are coming?
- Which clients are waiting?
- What does Dan recommend?
- Are any urgent items overdue or unowned?
- How many qualified inquiries arrived this week?
- Is the office under control?

The screen must use large text, minimal navigation, plain language, explicit source links and one-click printing. It must not become a wall of widgets.

## 9. Success metrics

- Atty. Batalla can answer the Executive Command Center questions in under two minutes.
- No unauthorized cross-firm or cross-matter access in automated RLS/storage tests.
- Every active matter has a responsible lawyer and visible next action.
- Every physical folder has a last known location or a visible exception state.
- Every deadline has an owner, source, confirmation state and change history.
- Every final/executed document has immutable version metadata and integrity hash.
- Every intake is resolved into declined, closed or approved/converted states.
- Every invoice total is reproducible from approved time and expense records.
- Every privileged export is approved, logged and time-bounded.
- Marketing reports can trace inquiry source through consultation, engagement and collected revenue.
- Office Memory entries remain attributable, reviewable and supersedable.
- Backup restoration succeeds in a scheduled drill before live client-document launch.

## 10. Content truth and launch blockers

Professional credentials, exact public profile details, practice areas, fees, testimonials, case results, awards, media claims and final legal notices must be verified. The internal system can be built without these assets, but the public launch may not publish placeholders as fact.

The CMS must support `draft`, `review`, `approved`, `published` and `archived` lifecycle states, an approver, approval timestamp, source document and expiry/review date.