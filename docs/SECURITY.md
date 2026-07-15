# Security Summary

The binding security plan is `08_SECURITY_PRIVACY_COMPLIANCE.md`.

Non-negotiables:

- RLS for every sensitive table.
- Matter-level and portal-specific authorization.
- AAL2 MFA for sensitive actions.
- Private document storage and short-lived signed URLs.
- Immutable versions and append-only audit/history.
- No service-role key in browser code.
- No live client data in Claude/Codex.
- No bulk export without approval, expiry and audit.
- Backup restoration and penetration testing before live document cutover.
