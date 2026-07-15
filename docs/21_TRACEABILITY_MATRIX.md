# Traceability Matrix

This is the minimum mapping. Each epic expands it with concrete test IDs.

| Module | Requirements | Primary screens | Core tables | Mandatory tests | Epic |
|---|---|---|---|---|---|
| Public/CMS | PUB-001..008 | Public pages, content admin | site_content, privacy_consents | form abuse, draft leakage, approval | 060 / existing foundation |
| Identity | IAM-001..008 | Login, users, security | memberships, membership_security, grants | cross-role, AAL2, revoke | 002 |
| Intake | INT-001..002,007..008 | Inbox, intake detail | inquiries, intakes, intake_parties | conversion idempotency, permissions | 011 |
| Conflict | INT-003..006 | Conflict review | conflict_* | candidate search, decision gates | 012 |
| Contacts | CRM-001..006 | Contacts, organizations | contacts, details, relationships, merge | duplicate/merge/cross-firm | 010 |
| Matters | MAT-001..009 | Matter list/workspace | matters, parties, memberships, status events | matter isolation, stale version, transitions | 013-015 |
| Calendar | CAL-001..007 | Tasks, calendar, deadline detail | tasks, deadlines, events, reminders | revision history, escalation, sync conflict | 015,020,021 |
| Documents | DOC-001..009 | Vault, preview, templates | documents, versions, shares, evidence | path isolation, immutable version, revoked share | 022-025 |
| Portal | POR-001..007 | Portal routes | portal users/memberships/shares/messages | other-matter denial, revoked session, payload filtering | 030-033 |
| Billing | BIL-001..009 | Time, expenses, invoices | arrangements, entries, invoices, payments | decimal totals, immutable issue, reconciliation | 040-045 |
| Security | SEC-001..010 | Audit, security, exports | audit, exports, holds, incidents | RLS matrix, export expiry, legal hold | 003,050-052 |
| AI | AI-001..006 | AI review surface | AI jobs/audit references | prompt injection, matter scope, human approval | 053-054 |
| Quality | NFR-001..008 | All | All | `tests/unit`, `tests/components`, `tests/integration`, `tests/e2e`, `supabase/tests`, build | 001 onward |
