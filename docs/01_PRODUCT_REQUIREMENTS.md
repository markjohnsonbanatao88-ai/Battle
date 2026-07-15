# Product Requirements

Requirement IDs are stable and must be referenced in PRs, tests and the traceability matrix.

## Public website and CMS

- **PUB-001** The public site shall provide Home, About, Practice Areas, Contact, Inquiry, Consultation Booking, Privacy and Disclaimer pages.
- **PUB-002** Unverified professional claims shall never render as published content.
- **PUB-003** Every public form shall state that submission does not create an attorney-client relationship.
- **PUB-004** Public forms shall capture explicit privacy consent version and timestamp.
- **PUB-005** Public submissions shall be rate limited, bot-protected, validated server-side and monitored for abuse.
- **PUB-006** Published content shall have an authorized approver, source reference and review date.
- **PUB-007** The CMS shall support preview, approval, publish, archive and rollback.
- **PUB-008** Public pages shall meet accessibility and responsive-design requirements.

## Identity and access

- **IAM-001** Every protected request shall verify a Supabase session server-side.
- **IAM-002** Every firm-owned query or mutation shall resolve an active firm membership.
- **IAM-003** Matter-sensitive access shall require matter authorization in addition to firm membership.
- **IAM-004** Sensitive administration shall require AAL2 MFA.
- **IAM-005** User invitation, activation, role change, suspension and offboarding shall be auditable.
- **IAM-006** External collaborator access shall have an expiry date and explicit matter scope.
- **IAM-007** Emergency access shall require reason, AAL2, approval or documented exception, and prominent audit alerts.
- **IAM-008** Client portal identity and permissions shall be separate from staff membership.

## Intake and conflict checks

- **INT-001** Staff shall convert a public inquiry into structured prospective-client intake without losing the original submission.
- **INT-002** Intake shall capture prospective client, adverse parties, related entities, matter summary, jurisdiction, urgency and source.
- **INT-003** The system shall search contacts, aliases, organizations, relationships and historical matter parties for conflict candidates.
- **INT-004** Fuzzy or phonetic matches shall be candidates, never automatic conflict conclusions.
- **INT-005** An authorized lawyer shall record conflict disposition, reasoning, reviewer and timestamp.
- **INT-006** A matter may not become `open` until conflict clearance and engagement approval are recorded.
- **INT-007** Declined prospects shall be retained under an approved retention policy with access restrictions.
- **INT-008** Intake conversion shall be transactional and idempotent.

## Contacts and organizations

- **CRM-001** Contacts shall support persons and organizations.
- **CRM-002** Persons shall support aliases, former names, contact methods, addresses and relationships.
- **CRM-003** Organizations shall support trade names, registration identifiers, officers, directors, representatives, parents and subsidiaries.
- **CRM-004** Duplicate detection shall surface probable matches before creation.
- **CRM-005** Merge shall preserve provenance and redirect references without destructive deletion.
- **CRM-006** Contact notes shall support confidentiality classification and matter scope.

## Matters

- **MAT-001** Every matter shall have a unique firm-controlled matter number.
- **MAT-002** Every active matter shall have a responsible lawyer.
- **MAT-003** Matter statuses shall follow approved transitions and retain history.
- **MAT-004** Matter access shall support viewer, contributor and manager membership plus restricted allowlists.
- **MAT-005** Matter parties shall identify role, adversity and representation relationships.
- **MAT-006** Matter workspace shall show summary, parties, team, chronology, tasks, deadlines, documents, communications, time and billing.
- **MAT-007** Status, responsible lawyer, confidentiality or closure changes shall record reason and audit event.
- **MAT-008** Closing a matter shall require closing checklist completion and retention classification.
- **MAT-009** Concurrent edits shall use optimistic version checks and reject stale updates.

## Tasks, events and deadlines

- **CAL-001** Tasks shall support assignee, reviewer, priority, status, due date, dependencies and completion evidence.
- **CAL-002** Deadlines shall record source, calculation method, confidence/confirmation and responsible owner.
- **CAL-003** Deadline changes shall preserve old value, new value, actor, reason and timestamp.
- **CAL-004** Hearings and appointments shall support location, remote link, attendees and reminders.
- **CAL-005** Reminders shall escalate based on urgency and remain visible until acknowledged.
- **CAL-006** External calendar synchronization shall never be the sole authoritative deadline record.
- **CAL-007** Completed or cancelled items shall remain auditable.

## Documents and evidence

- **DOC-001** All matter files shall live in private storage with matter-scoped paths.
- **DOC-002** Every document version shall be immutable and have file metadata and SHA-256 integrity hash.
- **DOC-003** Upload shall validate size, MIME type, extension, malware-scan state and uploader authorization.
- **DOC-004** Downloads shall use short-lived signed URLs generated only after authorization.
- **DOC-005** Document status shall support draft, review, final, executed and archived.
- **DOC-006** Sharing with clients or external users shall be explicit, revocable and time-bounded.
- **DOC-007** Evidence items shall support source, custodian, acquisition date, integrity hash and chain-of-custody events.
- **DOC-008** Deletion of executed, final, evidence or legal-hold material shall be blocked; supersede or archive instead.
- **DOC-009** Generated documents shall record template version, inputs and approver.

## Client portal and communications

- **POR-001** Clients shall see only explicitly shared matters, documents, messages, appointments, requests and invoices.
- **POR-002** Internal notes, conflict data, privileged strategy and staff-only documents shall never be portal-visible.
- **POR-003** Secure messages shall be matter-scoped and auditable.
- **POR-004** Client uploads shall enter a quarantine/review state before becoming matter documents.
- **POR-005** Portal invitations shall expire and require identity verification.
- **POR-006** Revoking portal access shall invalidate sessions and future signed links.
- **POR-007** Read/acknowledgment status shall be recorded for critical messages and shared documents.

## Billing and finance

- **BIL-001** Time entries shall store matter, worker, date, duration, narrative, rate source and billable state.
- **BIL-002** Expenses shall store amount, currency, date, category, receipt, payee and approval state.
- **BIL-003** Billing arrangements shall support hourly, fixed fee, retainer and non-billable/pro bono configurations.
- **BIL-004** Invoice calculations shall use database decimal values and reproducible line items.
- **BIL-005** Issued invoices shall be immutable; corrections use voids, credit notes or replacement invoices.
- **BIL-006** Payments shall be marked settled only by verified provider event or authorized manual reconciliation.
- **BIL-007** Retainer ledger shall preserve every debit, credit, adjustment and balance.
- **BIL-008** Financial access shall be constrained by role and matter authorization.
- **BIL-009** Reports shall distinguish billed, collected, outstanding, unbilled and written-off amounts.

## Audit, security and operations

- **SEC-001** RLS shall be enabled and tested for every tenant, matter, portal and financial table.
- **SEC-002** Service-role credentials shall never be exposed to the browser.
- **SEC-003** Sensitive events shall create append-only audit records with actor, subject, context and request correlation ID.
- **SEC-004** Exports shall require permission, reason, scope, expiration and audit trail.
- **SEC-005** Production shall implement rate limits, security headers, secrets management, dependency scanning and alerting.
- **SEC-006** Backups shall be encrypted and restoration-tested.
- **SEC-007** User offboarding shall revoke sessions, disable membership and transfer work.
- **SEC-008** Retention and legal hold shall prevent unauthorized destruction.
- **SEC-009** Logs shall minimize personal data and never contain document contents or secrets.
- **SEC-010** Incident response shall support detection, containment, investigation, notification assessment and recovery.

## AI

- **AI-001** Production AI shall be disabled until the AI release gate is approved.
- **AI-002** AI context shall be matter-scoped and authorization-checked server-side.
- **AI-003** AI outputs shall be labeled draft and require lawyer review.
- **AI-004** AI shall never autonomously send, sign, file, settle, advise a public user or commit legal positions.
- **AI-005** Prompt, model, source references, output, reviewer and disposition shall be auditable under an approved retention policy.
- **AI-006** Uploaded or retrieved content shall be treated as untrusted and isolated from system instructions.

## Quality and usability

- **NFR-001** Protected pages shall not expose confidential data in page source, logs, analytics or client caches beyond authorization.
- **NFR-002** Core workflows shall be keyboard accessible and responsive.
- **NFR-003** Empty, loading, error and permission-denied states shall be explicit.
- **NFR-004** Mutations shall be idempotent where retries are possible.
- **NFR-005** Search results shall respect the same RLS and matter authorization as direct access.
- **NFR-006** Production deployments shall pass lint, strict typecheck, unit, integration, RLS, E2E and build gates.
- **NFR-007** Critical queries shall have indexes and performance budgets defined before launch.
- **NFR-008** The system shall provide accessible audit-friendly exports without permitting unrestricted database dumps.
