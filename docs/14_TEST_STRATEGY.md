# Test Strategy

## Tooling target

- Unit/component: Vitest and React Testing Library.
- Database/RLS: Supabase local stack with SQL/pgtap or integration harness.
- E2E: Playwright.
- Static: ESLint, strict TypeScript and production build.
- Security: dependency/secret scanning and targeted dynamic checks.

Tool versions are selected in the relevant epic; tests are mandatory, not optional roadmap polish.

## Test layers

### Unit

- validation schemas;
- status transition guards;
- money calculations;
- deadline/reminder helpers;
- permission decision helpers used outside RLS;
- document path validation;
- redaction/logging helpers.

### Database/RLS

For every sensitive table, test:

- allowed same-firm role;
- denied different firm;
- denied same firm but unassigned matter;
- allowed explicit matter access;
- denied expired external grant;
- denied revoked portal user;
- denied guessed document/version ID;
- AAL2-required mutation denied at AAL1;
- audit/history write behavior.

### Storage

- path mismatch denied;
- cross-firm/matter path denied;
- unauthorized signed URL function denied;
- revoked share denied;
- upload quarantine state enforced;
- final/executed deletion blocked.

### Integration

- inquiry to intake;
- conflict decision to matter conversion;
- matter creation transaction and numbering;
- deadline revision history;
- document upload finalization;
- portal invitation/share/revocation;
- time/expense approval to invoice;
- payment to receipt;
- export approval/download expiry.

### E2E

Critical journeys:

1. Public inquiry submit and staff triage.
2. Intake, conflict check, engagement and matter opening.
3. Add matter team, task and confirmed deadline.
4. Upload/version/finalize/share document.
5. Portal invitation, login, message, upload and acknowledgment.
6. Time/expense, invoice issuance, payment and receipt.
7. Offboard staff and verify access revocation.
8. Highly restricted matter isolation.

## Security regression cases

- IDOR against every `[id]` route/action.
- role tampering and user-supplied `firm_id`.
- stale optimistic-concurrency update.
- signed URL reuse after expiry/revocation.
- public form abuse and oversized payload.
- malicious filename/MIME mismatch.
- stored XSS in names, messages and CMS.
- prompt injection document in AI test environment.
- service-role key absent from client bundle.

## Fixtures

Synthetic only. Names, firms, matters and documents must be fictional and clearly labeled. No real client data or copied privileged documents.

## CI gates

Every PR:

```text
format/lint
strict typecheck
unit/component tests
database/RLS tests
build
```

Protected branches additionally require relevant E2E tests. Release candidates require full E2E, migration dry run, backup/restore evidence and security checklist.

## Coverage principle

Do not chase a percentage alone. Every permission boundary, status transition, money calculation and destructive/high-risk action requires explicit positive and negative tests.
