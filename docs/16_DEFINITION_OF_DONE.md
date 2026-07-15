# Definition of Done

A feature is **not complete** merely because a page, table, button or API endpoint exists.

## Feature completion gate

All applicable items must be true:

### Product

- Requirement IDs and workflow step are identified.
- Success, error, empty, loading and permission states are implemented.
- Copy does not invent public facts or imply unauthorized legal advice.
- Accessibility and responsive behavior are verified.

### Data

- Schema and migration are additive and reviewed.
- Constraints, indexes and ownership keys exist.
- Status/history/row-version behavior is correct.
- Backfill and rollback impact are documented.

### Authorization

- Server identity check exists.
- Firm and matter/portal authorization exist.
- RLS and storage policies exist.
- AAL2 requirements exist where applicable.
- Negative authorization tests pass.

### Operations

- Audit event and correlation ID exist.
- Idempotency exists where retries are possible.
- Concurrent updates do not silently overwrite.
- Notifications/retries/failure handling exist where applicable.
- Logs are redacted and actionable.

### Testing

- Unit tests for validation/logic.
- Integration tests for mutation and history.
- RLS/storage positive and negative tests.
- E2E test for critical user journey.
- Regression test for every fixed security or data-loss bug.

### Documentation

- Relevant blueprint files updated.
- Traceability matrix updated.
- Migration and environment changes documented.
- User/admin behavior documented when operationally significant.

### Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run test:rls   # requires local Supabase/Docker or CI
npm run test:e2e   # critical journeys and release gates
npm run build
```

EPIC-001 supplies these scripts and CI jobs. An unavailable Docker daemon or browser binary must be reported as an unexecuted gate, never converted into a fake pass.

## Prohibited completion claims

Do not say “complete,” “production-ready” or “fully working” when:

- the page is read-only but CRUD was required;
- buttons are placeholders;
- RLS or storage tests are missing;
- only schema exists;
- audit/history is missing;
- errors are suppressed;
- a mock integration is presented as real;
- payment is recorded without verification;
- AI output bypasses human approval;
- public credentials are unverified;
- migration has not been applied/tested;
- live environment has not been configured.

## Release gate

A release additionally requires migration rehearsal, monitoring, backup/rollback evidence, security checklist, approved content and authorized sign-off.
