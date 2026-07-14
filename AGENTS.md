# Codex Implementation Rules

## Mission

Build Batalla & Associates as a secure law-office operating system. Preserve confidentiality, firm isolation, matter isolation, auditability, and factual public content.

## Before editing

1. Read `README.md`, `docs/PRODUCT_SCOPE.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and the relevant migration.
2. Search for an existing implementation before creating a duplicate.
3. State the acceptance criteria in the task or pull request.
4. Never use real client data in code, fixtures, screenshots, tests, or prompts.

## Required checks

Run all of the following before reporting completion:

```bash
npm run lint
npm run typecheck
npm run build
```

Do not bypass failures. Do not add `ignoreBuildErrors`, `|| true`, broad `any`, disabled RLS, public buckets, or browser-exposed secrets.

## Database changes

- Every firm-owned row needs `firm_id`.
- Every sensitive record needs RLS.
- Matter records require matter-level access, not firm membership alone.
- Migrations are additive and reviewable.
- Destructive migrations require an explicit backup and rollback plan.

## Pull requests

Keep each PR focused. Include changed files, migration impact, security impact, commands run, unresolved risks, and screenshots using synthetic data only.
