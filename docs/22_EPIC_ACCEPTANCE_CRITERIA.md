# Epic Acceptance Criteria

Each epic must satisfy the global Definition of Done plus the specific conditions below.

## Foundation

### EPIC-001 Test infrastructure

- Vitest/RTL, Playwright and local Supabase test workflow are installed and documented.
- CI runs unit and RLS tests on every PR.
- At least one component, validation, server-action integration and RLS isolation test pass.
- Deliberately weakening a tested policy fails CI.

### EPIC-002 Auth, MFA and memberships

- Admin can invite, activate, change role, disable and offboard a synthetic user.
- Sensitive changes require AAL2.
- Disabled user and revoked sessions lose access.
- Every change creates an audit event.
- Cross-firm and self-escalation tests fail safely.

### EPIC-003 Audit and request correlation

- Every protected mutation has a request ID.
- Audit viewer filters by actor, event, object, matter, date and outcome.
- Audit records cannot be updated/deleted through normal roles.
- Sensitive payloads are redacted.

## Intake and legal core

### EPIC-010 Contact/organization CRM

- Person and organization CRUD, aliases, contact methods, addresses and relationships work.
- Duplicate candidates display before create.
- Approved merge preserves references/history.
- Firm isolation tests pass.

### EPIC-011 Structured intake

- Inquiry converts without losing original submission.
- Intake records client/adverse parties, urgency, jurisdiction, owner and missing information.
- Status transitions are enforced and audited.
- Conversion is idempotent.

### EPIC-012 Conflict checking

- Search includes names, aliases, organizations, relationships, prior intakes and matter parties.
- Candidate reasons are visible.
- Only authorized lawyer records append-only decision.
- Matter opening is blocked without approved disposition.

### EPIC-013 Engagement and matter opening

- Versioned engagement record and opening checklist exist.
- Matter number is generated transactionally.
- Conversion creates matter, parties, team and initial events atomically.
- Retry cannot create duplicate matter.

### EPIC-014 Matter workspace

- Overview, parties, team, chronology, notes and status history are operational.
- Restricted titles/content do not leak.
- Status/responsible lawyer/confidentiality changes require reason and audit.

### EPIC-015 Tasks and concurrency

- CRUD, assignment, reviewer, priority, dependency and completion evidence work.
- Stale update is rejected and surfaced.
- Overdue filters and matter isolation tests pass.

## Deadlines and documents

### EPIC-020 Deadlines/reminders

- Deadline requires source, owner and confirmation state.
- Revision preserves prior value/reason.
- Reminder instances are idempotent and escalated.
- External calendar is not authoritative.

### EPIC-021 Calendar integration

- Provider abstraction, encrypted token reference, sync mapping and conflict queue exist.
- Disconnect preserves internal events.
- Webhook/sync retry is idempotent.

### EPIC-022 Private document vault

- Authorized upload, quarantine, scan state, immutable version, hash and signed download work.
- Cross-firm/matter paths and guessed IDs fail.
- New version does not overwrite old bytes.

### EPIC-023 Review/templates/generation

- Document status approvals are enforced.
- Template versions are immutable and approved.
- Generated document records template/input snapshot and starts as draft.

### EPIC-024 Evidence chain

- Evidence original, hash, source and custodian are recorded.
- Custody/access/export events are append-only.
- Hash mismatch triggers blocked integrity state.

### EPIC-025 E-signature

- Approved provider, signed webhook validation and idempotency exist.
- Executed result imports as immutable new version.
- Failed/expired/declined states are visible and audited.

## Client collaboration

### EPIC-030 Portal identity

- Invitation expiry, identity link, terms acceptance and revocation work.
- Portal RLS is separate from staff RLS.
- Revoked user cannot access data or generate links.

### EPIC-031 Portal sharing

- Explicit version/object shares, expiry, revoke and acknowledgment work.
- Internal notes/strategy never appear in portal payload.
- Sharing new internal version is not automatic.

### EPIC-032 Messaging/requests

- Internal and portal threads are separate.
- Sent messages are immutable.
- Client uploads are quarantined.
- Requests have due/completion/review state.

### EPIC-033 Portal appointments

- Approved event is shared to intended client only.
- Confirmation, cancellation and reschedule history are retained.
- Timezone is unambiguous.

## Billing

### EPIC-040 Arrangements/rates

- Hourly, fixed, retainer and non-billable configurations are versioned.
- Historical entries keep rate snapshot.
- Approval and role gates pass.

### EPIC-041 Time/expenses

- Entry, validation, approval, return/reject and revision history work.
- Invoiced items cannot be edited directly.
- Receipt access follows matter/financial permission.

### EPIC-042 Retainer ledger

- Credits/debits/adjustments are append-only.
- Transactional derived balance matches ledger.
- Unauthorized adjustment and negative-policy breaches are blocked.

### EPIC-043 Invoicing

- Draft/review/approve/issue/overdue/paid/void/credit-note states work.
- Issued snapshot and number are immutable.
- Decimal totals reproduce from lines.

### EPIC-044 Payments/receipts

- Manual reconciliation requires reference/evidence/authorized user.
- Provider event path, when enabled, verifies signature/idempotency.
- Receipt issues only from verified allocation.

### EPIC-045 Reports

- Definitions are documented.
- Queries are permission-filtered and paginated/export-controlled.
- Totals reconcile with source records.

## Governance and AI

### EPIC-050 Retention/legal hold

- Hold blocks eligible destruction.
- Disposition produces review queue, approval and report.
- No automated destruction before policy approval.

### EPIC-051 Exports/privacy requests

- Export has scope, reason, approval, expiry and download audit.
- Privacy request tracks verification, decision and response.
- Bulk unauthorized export fails.

### EPIC-052 Operational security

- Incident workflow, session/external-grant visibility, integration health and backup status exist.
- Offboarding runbook is testable.

### EPIC-053 AI infrastructure

- Kill switch, approved provider configuration, matter-scoped retrieval, citations, audit and human-review state exist.
- Prompt-injection and cross-matter tests pass.

### EPIC-054 AI use cases

- One approved use case is evaluated with synthetic/staging data.
- Output is draft, source-linked and cannot autonomously act.
- Reviewer disposition and quality/safety metrics are recorded.

## Production readiness

### EPIC-060 Public launch content

- Verified-content register is approved for every published claim.
- Privacy/disclaimer/consent text has authorized review.
- Accessibility, SEO metadata and public form protection pass.

### EPIC-061 Data import

- Source inventory, mapping, validation, staging, duplicate report and rollback exist.
- No raw uncontrolled production import.

### EPIC-062 Security/recovery validation

- Restore drill, penetration test and incident exercise findings are resolved or accepted by authorized owner.

### EPIC-063 Cutover

- Production environment, admin MFA, monitoring, backups, training, support ownership and rollback are confirmed.
- No unresolved critical/high security issue.
