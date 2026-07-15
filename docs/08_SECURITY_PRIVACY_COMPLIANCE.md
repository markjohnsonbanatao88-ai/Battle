# Security, Privacy and Compliance Blueprint

This is an engineering control plan, not a substitute for formal Philippine legal and privacy review.

## Threat model

Protect against:

- unauthorized firm or matter access;
- compromised staff or portal accounts;
- accidental external sharing;
- insecure signed URLs;
- malicious uploads and document prompt injection;
- stale sessions after offboarding;
- bulk extraction and export abuse;
- secrets in browser bundles or logs;
- SQL/RLS policy mistakes;
- silent data overwrite;
- dependency/supply-chain compromise;
- lost or stolen devices;
- backup failure;
- insider misuse.

## Data classification

- **Public:** approved website content.
- **Internal:** operational information not intended for clients/public.
- **Confidential:** client/matter business information.
- **Privileged:** legal advice, strategy and protected communications.
- **Highly Restricted:** specially sensitive matters or evidence with explicit allowlist.

Classification affects access, search, sharing, logging, exports and retention.

## Identity and sessions

- Supabase Auth; secure SSR cookie handling.
- Staff MFA required before production; AAL2 required for sensitive actions.
- Portal MFA/risk controls based on approved policy and data sensitivity.
- Session revocation on offboarding, password reset, suspected compromise and role downgrade where required.
- Never trust user-supplied `firm_id`, role or matter access.

## Database and RLS

- RLS on every non-public table.
- Separate staff and portal access functions.
- Composite firm-bound foreign keys.
- Security-definer functions use fixed `search_path`, minimum grants and reviewed SQL.
- Negative tests for cross-firm, unassigned matter, revoked portal and expired external access.
- Service role restricted to trusted server/background contexts.

## Storage

- Private buckets only for legal documents.
- Paths include firm and matter identifiers validated against metadata.
- Signed URLs are short-lived and generated after every authorization check.
- Uploads are quarantined until validation and malware scan pass.
- Object metadata and database record must agree before availability.
- No predictable permanent public URLs.

## Application security

- Strict server-side validation.
- CSRF-safe mutation patterns and same-site cookies.
- Rate limits by route, identity and risk signal.
- Security headers: CSP, HSTS, frame restrictions, MIME sniffing protection and referrer policy.
- No unsafe HTML rendering without sanitization.
- File preview sandboxing.
- Dependency and secret scanning in CI.
- Structured error handling with request IDs.

## Privacy engineering

- Collect only data necessary for intake or legal work.
- Record purpose and notice/consent version for public forms and portal onboarding.
- Separate marketing consent from service intake.
- Provide controlled workflows for access, correction, objection/withdrawal and deletion requests subject to legal obligations.
- Retention rules and legal holds control destruction.
- Logs minimize personal data.
- Analytics on public pages must not receive confidential form contents.

## Audit

Log at minimum:

- authentication and MFA changes;
- membership/role/access changes;
- matter opening/closing/status/access;
- conflict decisions;
- deadline revisions;
- document upload/download/share/revoke/status;
- client portal invitation/revocation;
- invoice issue/void/payment/receipt;
- export approval/download;
- retention/legal hold;
- emergency access;
- security incident changes.

Audit events are append-only. Do not expose before/after full document bodies.

## Export controls

- Scope-limited export jobs.
- Reason and requester.
- Approval for bulk or privileged exports.
- AAL2 for high-risk exports.
- Encrypted temporary file, expiry and download limit.
- Watermark where appropriate.
- Full audit of creation and download.

## Retention and legal hold

- Retention schedule remains a firm/legal approval item.
- Until approved, no automated permanent destruction.
- Legal hold immediately blocks eligible deletion/destruction.
- Retention engine operates through reviewable disposition jobs, not direct cron deletion.

## Incident response

Roles: incident lead, technical lead, privacy/legal reviewer and communications approver. Runbook covers detection, triage, containment, evidence preservation, credential rotation, affected-data assessment, notification decision, recovery and lessons learned.

## Pre-production security gates

- RLS/storage negative test suite passes.
- MFA and offboarding tested.
- Rate limiting and bot protection deployed.
- Backup restoration drill succeeds.
- Secrets scan clean.
- Dependency audit reviewed.
- Penetration test completed before live client documents.
- Privacy notice, retention and incident procedures approved.
