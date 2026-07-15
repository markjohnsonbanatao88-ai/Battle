# Release Checklists

## Pull request

- Epic and requirement IDs.
- Focused diff; no unrelated refactor.
- Migration/RLS/storage impact documented.
- UI/server/audit/tests delivered together.
- Synthetic screenshots.
- Lint/typecheck/tests/build pass.
- No secrets or real client data.
- Traceability and project state updated.

## Staging release

- Migrations rehearsed from current staging state.
- Seed/fixtures synthetic and current.
- Full RLS/storage suite passes.
- Critical E2E journeys pass.
- Error monitoring and jobs healthy.
- Rollback/forward-fix plan recorded.

## Public website launch

- Verified-content register approved.
- Privacy, disclaimer and consent approved.
- Domain/TLS/security headers configured.
- Rate limiting and bot protection enabled.
- Accessibility and responsive review passed.
- Inquiry/consultation notifications and ownership confirmed.

## Internal legal-operations launch

- Admin and staff MFA enforced.
- User roles and matter access reviewed.
- Conflict, matter, task and deadline workflows trained.
- Backup restore drill passed.
- Support/incident owner identified.
- No critical/high security findings.

## Document vault launch

- Private bucket and path/RLS tests pass.
- Malware scan/quarantine active.
- Signed URL expiry/revocation tested.
- Backup and storage recovery validated.
- Penetration test completed before live privileged files.

## Client portal launch

- Portal isolation and revocation tests pass.
- Terms/privacy/identity policy approved.
- Message/upload support ownership confirmed.
- No staff-only payload leakage.

## Billing launch

- Arrangements/rates/tax/payment terms approved.
- Invoice/receipt numbering configured.
- Calculation and reconciliation tests pass.
- Authorized financial roles confirmed.
- Accounting reconciliation procedure approved.

## AI launch

- Vendor/data-use review approved.
- Kill switch operational.
- Matter scope, citations, prompt injection and human approval tested.
- Approved use case and retention documented.
- No autonomous legal action.

## Production cutover

- Environment variables/secrets verified.
- Admin accounts and MFA verified.
- Monitoring/alerts/backups operational.
- Data import reconciled.
- Smoke/E2E tests pass.
- Rollback decision owner available.
- Training and operating runbook delivered.
