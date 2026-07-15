# Architecture Summary

Read `MASTER_INDEX.md`, `05_DATA_MODEL_BLUEPRINT.md`, `06_SERVER_ACTIONS_API_CONTRACTS.md` and `08_SECURITY_PRIVACY_COMPLIANCE.md` for the binding architecture.

Core trust chain:

1. Untrusted browser.
2. Supabase server-verified identity.
3. Active firm membership.
4. Role and AAL2 checks.
5. Matter or portal access.
6. PostgreSQL RLS and private Storage enforcement.
7. Typed server actions/RPC with validation, concurrency and audit.
8. Vercel/Supabase secrets outside the repository.

Initial deployment may serve one firm, but all tenant and matter boundaries remain structurally enforced.
