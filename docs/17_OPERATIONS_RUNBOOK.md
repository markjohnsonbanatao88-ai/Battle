# Operations Runbook

## Environments

- Local: synthetic data only.
- Preview: per-PR Vercel deployment using isolated/non-production Supabase where feasible.
- Staging: production-like synthetic or approved anonymized data.
- Production: live client data with restricted access and monitoring.

Never connect arbitrary preview deployments to production service-role credentials.

## Setup

1. Create Supabase projects/environments.
2. Configure approved Vercel environment variables.
3. Apply migrations in order through reviewed deployment process.
4. Seed firm and first admin through controlled script.
5. Enforce MFA.
6. Configure domain, email, rate limiting and monitoring.
7. Run full smoke and RLS tests.

## Deployment

- Pull request with CI, migration impact and screenshots.
- Claude architecture/security review for high-risk changes.
- Merge to protected main.
- Apply migration with logged operator.
- Deploy Vercel.
- Run post-deploy smoke tests.
- Monitor errors and audit anomalies.
- Roll back application or forward-fix migration according to plan.

## Secrets

- Store in Supabase/Vercel secret management.
- Never commit `.env.local`.
- Rotate after suspected exposure or personnel change.
- Record owner, purpose, environment and rotation date outside source code.

## Backups

- Enable provider backups according to approved service level.
- Encrypt exports and restrict access.
- Perform scheduled restore drill into isolated environment.
- Verify schema, RLS, storage references and sample workflows.
- Record recovery time and gaps.

## Monitoring

- application errors and failed jobs;
- auth/MFA anomalies;
- repeated forbidden access;
- bulk downloads/exports;
- upload scan failures;
- notification failures;
- database capacity/latency;
- backup status;
- provider/webhook failures.

## Offboarding

Use WF-13. Offboarding is not complete until sessions are revoked, work is transferred and recent high-risk activity is reviewed.

## Incident handling

Use WF-14. Do not delete evidence or logs during containment. Do not make notification claims without authorized privacy/legal review.

## Business continuity

- Maintain current contact tree and service owners.
- Document manual fallback for deadlines, hearings, client contact and billing.
- Keep read-only recovery exports only under approved encrypted procedures.
- Test office access loss and provider outage scenarios.

## Data import

No uncontrolled CSV dump directly into production. Import jobs validate, stage, deduplicate, map contacts/matters, report errors and require approval before commit.
