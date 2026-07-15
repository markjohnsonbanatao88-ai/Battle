# EPIC-002 — Authentication, MFA and Membership Hardening

## Objective

Deliver the complete staff identity lifecycle needed before legal-operational modules expand: controlled invitations, secure activation, mandatory MFA for active office access, server-enforced role administration, suspension, offboarding and session revocation.

## Implemented vertical slice

### Invitation and activation

- Firm administrators invite staff through a server-only Supabase Admin client.
- Invitations create a pending firm membership tied to the invited email.
- The activation screen requires the invited user to set a password and display name.
- `activate_own_membership` validates the authenticated email before changing the membership to `active`.

### MFA and session assurance

- Active dashboard access requires TOTP MFA at AAL2.
- The MFA screen supports enrollment, QR/secret display and six-digit verification.
- Server authorization re-checks the current AAL; the browser cannot grant itself administrative access.
- A membership-level `session_revoked_at` timestamp rejects tokens issued before a revocation event.

### Staff administration

- Only active `firm_admin` users at AAL2 may invite staff or change lifecycle state.
- Supported actions: role change, suspend, offboard, restore and revoke sessions.
- Suspension and offboarding ban the Supabase Auth identity and remove RLS eligibility.
- Restoration clears the Auth ban but still requires a fresh authenticated session.
- The final active firm administrator cannot be demoted, suspended or offboarded.

### Database enforcement

- Membership states are constrained to `invited`, `active`, `suspended` and `offboarded`.
- Membership checks now require an active state and a token issued after the latest revocation timestamp.
- Administrative membership policies require both `firm_admin` and AAL2.
- A direct membership-to-profile relationship supports safe same-firm staff roster display without exposing `auth.users` to the browser.
- Audit triggers record invitations, role changes, status transitions and session revocations.

## Security properties

- No client-side-only authorization.
- No service-role key is exposed through a public environment variable.
- AAL1 sessions cannot administer staff.
- A user cannot self-promote by updating their own membership.
- Suspended and offboarded users fail RLS membership checks.
- Tokens issued before a revocation event fail RLS membership checks.
- The last active firm administrator is protected at the database layer.

## Test coverage

- Unit validation tests cover invitation normalization and malformed lifecycle requests.
- Supabase pgTAP tests cover AAL1 denial, AAL2 administration, self-escalation denial, final-admin protection, invitation activation, suspension and stale-session revocation.
- Existing public Playwright smoke coverage remains active.

## Configuration required for production

- `SUPABASE_SERVICE_ROLE_KEY` must exist only in server-side Vercel/Supabase environments.
- Supabase Auth redirect URLs must include `/auth/callback` for the production domain.
- Email delivery should use an approved SMTP provider before staff invitations are treated as operationally reliable.

## Rollout

1. Apply migration `202607160001_epic002_auth_membership_hardening.sql`.
2. Add the service-role secret to the server environment.
3. Confirm the existing seed administrator can sign in and enroll TOTP.
4. Invite one synthetic staff account and complete activation/MFA.
5. Verify role change, session revocation, suspension and restoration using synthetic users.
6. Keep a Supabase admin-console recovery procedure for the initial administrator during rollout.

## Rollback

Application rollback may revert the UI/routes while retaining the additive membership columns. Do not drop lifecycle or audit data during an emergency rollback. If the stricter policies must be disabled, restore the prior policy definitions through an explicit reviewed migration rather than editing production policies manually.