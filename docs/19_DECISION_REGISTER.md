# Decision Register

## Approved decisions

| ID | Decision | Status |
|---|---|---|
| DEC-001 | Product is Batalla & Associates Law Office OS: public site plus private law-office operations. | Approved |
| DEC-002 | Stack is Next.js, Supabase, Vercel and GitHub. | Approved |
| DEC-003 | Claude reviews architecture/security/workflows; Codex implements controlled tasks. | Approved |
| DEC-004 | Firebase, Firestore, Genkit, eMango and unrelated BarangayOS modules are prohibited. | Approved |
| DEC-005 | Initial use is one firm, but schema and RLS remain multi-tenant safe. | Approved |
| DEC-006 | Primary timezone is Asia/Manila and primary currency is PHP. | Approved |
| DEC-007 | Legal records are archived/superseded; hard deletion is exceptional and policy-controlled. | Approved |
| DEC-008 | Document storage is private; access uses short-lived signed URLs. | Approved |
| DEC-009 | Matter-level access is required; firm membership alone is insufficient for confidential matter data. | Approved |
| DEC-010 | Highly restricted matters require explicit allowlist access. | Approved |
| DEC-011 | Public professional claims remain draft until written verification. | Approved |
| DEC-012 | AI is disabled for live client content until the AI release gate. | Approved |
| DEC-013 | Manual payment reconciliation is the first payment workflow; no provider is assumed. | Approved |
| DEC-014 | Billing uses immutable issued invoices and append-only ledgers. | Approved |
| DEC-015 | Client portal receives explicit object shares, never an internal-workspace mirror. | Approved |
| DEC-016 | No feature is complete without UI, server operation, validation, RLS, audit, errors and tests. | Approved |
| DEC-017 | Branding direction is deep charcoal/black/gold/ivory, premium legal authority, no cheap stock imagery or fake credentials. | Approved |

## Needs firm approval before implementation or public launch

| ID | Decision needed | Default until approved |
|---|---|---|
| OPEN-001 | Exact public attorney name styling, title and credentials including IBP/PTR/MCLE details. | Do not publish. |
| OPEN-002 | Official public office address, phone numbers and email. | Keep draft/unpublished. |
| OPEN-003 | Approved practice areas and descriptions. | Hide practice-area claims. |
| OPEN-004 | Approved fee language and consultation charging policy. | Do not publish fee claims. |
| OPEN-005 | Testimonials and case-result policy. | Do not publish. |
| OPEN-006 | Final privacy notice, terms, disclaimer, intake consent and conflict language. | Use clearly labeled review drafts only. |
| OPEN-007 | Staff roles and exact internal approval thresholds. | Use documented role defaults; no sensitive delegation. |
| OPEN-008 | Matter numbering format. | Use configurable sequence; no production numbers until set. |
| OPEN-009 | Retention schedule and legal-hold authority. | No automated permanent destruction. |
| OPEN-010 | External calendar provider. | Build provider abstraction only. |
| OPEN-011 | Email provider and mailbox capture method. | No production send/capture integration. |
| OPEN-012 | E-signature provider. | Do not implement provider-specific flow. |
| OPEN-013 | Payment provider. | Authorized manual reconciliation only. |
| OPEN-014 | Client portal MFA and identity-verification level. | Strong invitation and session controls; decide before live portal. |
| OPEN-015 | AI model/vendor and approved use cases. | Development agents only; no live client content. |
| OPEN-016 | Backup retention and recovery objectives. | Provider defaults are not accepted as final policy. |
| OPEN-017 | Whether firm admins may access matter contents by default. | Metadata only; explicit matter access. |

## Decision process

- Claude identifies policy gaps and proposes options with security/operational consequences.
- Human owner or authorized firm representative approves.
- Record decision, date, approver and affected documents.
- Codex implements only after status is Approved.
