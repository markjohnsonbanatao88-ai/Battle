# Claude, Codex, GitHub, Supabase and Vercel Operating System

## Roles

### Claude

- Read the master index and current state.
- Audit architecture, workflow, permissions, threat model and PR diff.
- Identify contradictions and unapproved assumptions.
- Produce dependency-aware epic plans and acceptance tests.
- Never claim implementation completion based on documentation alone.

### Codex

- Implement one approved epic or cohesive subset.
- Inspect existing code before creating new abstractions.
- Add migrations, RLS, actions, UI, audit and tests together.
- Run all gates and report exact results.
- Never suppress failures or use real client data.

### GitHub

- Source of code truth, issues, branches, PRs, reviews and CI.
- Main branch protected.
- PRs reference requirement IDs and epic.
- Security-sensitive migrations require review.

### Supabase

- Auth, PostgreSQL, RLS, private Storage and approved background/database functions.
- RLS is authoritative.
- Service role stays server-side.

### Vercel

- Next.js hosting, preview deployments and environment secrets.
- Preview environments must not expose production client data.

## Work cycle

1. Claude reads docs/code and selects next unblocked epic.
2. Claude writes implementation brief: requirements, files, schema, permission, tests and risks.
3. Codex creates branch and implements.
4. Codex runs gates and opens PR with evidence.
5. Claude reviews diff against security, workflow and definition of done.
6. Codex fixes verified findings.
7. CI passes and human merges.
8. Migration/deployment follows runbook.
9. Update `PROJECT_STATE.md`, roadmap and traceability matrix.

## Required Claude kickoff prompt

```text
Read MASTER_INDEX.md and all mandatory files. Audit the repository against PROJECT_STATE.md and BUILD_MANIFEST.json. Do not code. Identify the next unblocked epic, contradictions between docs/code/schema, required migrations, RLS/storage policies, screens/actions, audit events, tests, rollout and decisions needing approval. Do not reintroduce prohibited technologies or claim placeholders are complete.
```

## Required Codex task shape

```text
Epic and requirement IDs:
Objective:
Dependencies:
In scope:
Out of scope:
Schema/RLS/storage changes:
Routes/components/actions:
Audit events:
Acceptance tests:
Commands:
Migration/rollback notes:
Prohibited shortcuts:
```

## PR report

- branch and commit;
- epic/requirements;
- changed files;
- migration impact;
- security/privacy impact;
- tests and commands with exact result;
- screenshots using synthetic data;
- unresolved risks/decisions;
- definition-of-done checklist.

## Stop conditions

Agent must stop and record a decision request when work requires:

- inventing public credentials/content;
- changing role authority or retention policy;
- selecting a vendor/provider;
- exposing matter data more broadly;
- destructive migration;
- production secret/client data;
- bypassing a failing gate.
