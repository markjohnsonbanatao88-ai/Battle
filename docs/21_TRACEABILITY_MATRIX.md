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

## Phase 1A concrete traceability

| Requirement | Implemented behavior | Primary code/database evidence | Executable evidence | Current boundary |
|---|---|---|---|---|
| PUB-003 | Inquiry acknowledgment states no attorney-client relationship | `src/components/forms/InquiryForm.tsx` | `tests/components/InquiryForm.test.tsx`, Playwright public smoke | Approved wording still requires final firm/legal review before production |
| PUB-005 | Honeypot, strict validation, durable hourly fingerprint limit and safe public errors | public inquiry route and `submit_public_inquiry` RPC | `tests/integration/public-inquiry-route.test.ts`, `supabase/tests/002_phase1a_intake_conflict_consultation.test.sql` | Production bot provider and monitoring remain later launch work |
| IAM-001 / IAM-002 | Every protected action resolves the server session and active firm membership | `requireFirmContext`, Phase 1A server actions and RLS functions | `tests/integration/phase1a-protected-actions.test.ts`, all Phase 1A pgTAP suites | EPIC-002 session-revocation enforcement remains separate |
| INT-001 | Structured intake is linked to the immutable original inquiry | `intakes.inquiry_id`, original-submission protection trigger | Phase 1A pgTAP workflow suite | Matter conversion is not part of Phase 1A |
| INT-002 | Intake captures client/adverse parties, organizations, aliases, urgency, jurisdiction, summary, source and missing information | inquiry detail screen, `intakes`, `intake_parties` | protected-action test and Phase 1A pgTAP workflow suite | Full contact relationship graph is EPIC-010 |
| INT-003 | Conflict candidates search contacts, aliases, prior intakes and matter parties | `run_conflict_check` RPC and conflict tables | Phase 1A pgTAP workflow suite | Relationship expansion and fuzzy/phonetic matching remain EPIC-012 follow-up |
| INT-004 | Search produces warnings/candidates only; no automatic legal conclusion | conflict review UI and decision RPC separation | pgTAP decision-gate assertions and staging Gate C | Exact normalized matching only in this slice |
| INT-005 | Only managing partner, partner or associate may review and decide; reasoning and timestamps are append-only | lawyer-only migration, server actions and immutable decision trigger | `supabase/tests/003_phase1a_lawyer_authority.test.sql`, protected-action test | Firm-approved role thresholds remain subject to decision register review |
| CAL-004 | Cleared intake can create a lawyer appointment with mode and Philippine-time start/end | consultation scheduling RPCs and inquiry detail screen | protected-action test and Phase 1A pgTAP overlap assertions | Full event attendee/location/reminder model remains EPIC-020/021 |
| SEC-001 | Firm isolation and RLS apply to intake/conflict records | RLS policies and restricted grants | existing isolation suite plus Phase 1A cross-firm assertions | Production penetration test remains EPIC-062 |
| SEC-003 | Submission, intake, party, search, review, decision and schedule actions create audit events | controlled PostgreSQL functions | Phase 1A pgTAP audit assertions | Request correlation/redacted diff service remains EPIC-003 |
| NFR-002 / NFR-003 | Large controls, plain-language next actions, responsive queues and explicit empty/error states | Command Center, inquiry queue/detail and print CSS | build, Playwright smoke and staging runbook | Old-school office-user acceptance remains manual before merge |
| NFR-006 | Lint, unit/integration, build, strict type, browser, migrations and RLS gates run in CI | `.github/workflows/ci.yml` | GitHub Actions | Every new head must pass again before review/merge |
| Operational rollback | Feature can be withdrawn and restored without deleting legal records | `supabase/rollback/phase1a_feature_withdrawal.sql` and restore script | CI withdrawal/restore rehearsal | Production execution requires approved incident/change record |

Manual staging and print/PDF evidence is defined in `docs/runbooks/PHASE-1A-STAGING-ACCEPTANCE.md`. Automated evidence never replaces lawyer review or whole-office usability acceptance.
