# Security Baseline

## Non-negotiable controls

- RLS on every tenant or matter table.
- No service-role key in browser code or `NEXT_PUBLIC_` variables.
- Private document bucket only.
- Signed, time-limited document delivery.
- AAL2 MFA for sensitive administration.
- Server-side identity verification for protected routes.
- Matter-level access for confidential records.
- Append-only audit records.
- No silent build or lint failures.
- No real client data in development-agent prompts, logs, fixtures, screenshots, or issue reports.

## Public forms

The baseline includes schema validation, consent, and a honeypot. Production still requires rate limiting, bot protection, abuse monitoring, notification delivery, and a formally approved privacy notice.

## AI development agents

Claude and Codex may work on repository code, tests, schemas, documentation, and synthetic fixtures. They must not receive live client names, documents, privileged communications, access tokens, database dumps, production logs containing personal data, or service-role credentials.

## Production review still required

- Data Privacy Act compliance review
- Retention schedule
- Legal hold process
- Incident response plan
- Backup restoration test
- User offboarding and session revocation
- Vendor and subprocessors review
- Penetration test before storing live client documents
