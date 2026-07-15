# Codex Implementation Contract

## Mission

Build Batalla & Associates Law Office OS according to `docs/MASTER_INDEX.md`. Preserve confidentiality, firm isolation, matter isolation, portal isolation, auditability, public factual accuracy and human legal approval.

## Before editing

1. Read the assigned epic and all linked workflow, permission, data, screen, security and test sections.
2. Inspect existing code/migrations and avoid duplicate systems.
3. State requirement IDs and acceptance criteria.
4. Check `docs/19_DECISION_REGISTER.md`; do not invent unapproved policy.
5. Use synthetic data only.

## Implementation rule

Deliver the full vertical slice required by `docs/16_DEFINITION_OF_DONE.md`: schema, constraints, RLS/storage, server operation, UI, validation, concurrency, audit, errors, tests and documentation.

## Prohibited shortcuts

- Firebase, Firestore, Genkit, eMango or BarangayOS.
- `ignoreBuildErrors`, `|| true`, broad `any`, disabled RLS or public legal-document buckets.
- Service-role secrets in browser or `NEXT_PUBLIC_*`.
- User-supplied authorization facts.
- Mutable issued invoices/final versions or silent last-write-wins.
- Real client data in code, tests, screenshots, logs or prompts.

## Required checks

Run all scripts available for the epic. At minimum:

```bash
npm run lint
npm run typecheck
npm run build
```

EPIC-001 is implemented. Run `npm run test:unit` for every change, `npm run test:rls` for schema/RLS changes, and `npm run test:e2e` for affected critical journeys. Report unavailable Docker/browser gates honestly and rely on required GitHub CI before merge.

## PR report

Include epic/requirements, changed files, migration/security impact, tests with exact results, synthetic screenshots, rollout/rollback and unresolved risks. Never claim completion unless the definition of done passes.
