# EPIC-002 Implementation Report

**Status:** In progress

**Branch:** `epic-002/auth-membership-hardening-v1`

**Tracking issue:** #4

## Objective

Harden BatallaOS authentication and firm membership administration so privileged changes require MFA/AAL2, cannot be performed through direct client table writes, cannot cross firm boundaries, cannot silently self-escalate, and always preserve an auditable history.

## Implemented in this slice

- Added lifecycle metadata to `firm_memberships`:
  - inviter
  - activation, disable, offboarding and session-revocation timestamps
  - actor and written reason
  - optimistic-concurrency revision
- Added an authorized member-directory RPC.
- Added controlled invitation and membership-change RPCs.
- Required AAL2 for all sensitive membership changes.
- Prevented self role/status changes.
- Restricted privileged-role grants to a managing partner.
- Prevented removal of the last active managing partner.
- Rejected stale updates by expected revision.
- Made offboarded memberships immutable.
- Prevented authenticated clients from directly inserting, updating or deleting membership rows.
- Added append-only audit events for invitation, activation, role change, disable, offboarding and session-revocation actions.
- Added pgtap coverage for AAL2, cross-firm denial, self-escalation denial, privileged-role restrictions, stale revision rejection, last-managing-partner protection, session-revocation markers and immutable offboarding.

## Not yet complete

This is not the complete EPIC-002 vertical slice. Remaining work:

- server-only Supabase Auth invitation orchestration;
- MFA enrollment/challenge interface;
- membership administration screen;
- immediate application enforcement of `session_revoked_at`;
- activation and account-ban synchronization with Supabase Auth;
- route/component/integration tests;
- final rollout/rollback instructions and screenshots using synthetic data.

## Security impact

The database becomes the authoritative membership-change boundary. Browser code cannot mutate `firm_memberships` directly after this migration. The service-role key remains server-only and is not introduced by this slice.

## Migration and rollback

The migration is additive except for removal of direct authenticated membership-write privileges and the old direct-write RLS policies. Rollback must not discard lifecycle/audit history. A rollback may restore the previous policies only as a temporary emergency measure after explicit security approval.

## Verification required

- GitHub quality job
- local Supabase migration application
- all pgtap/RLS tests, including `002_membership_hardening.test.sql`

Do not mark EPIC-002 complete until every item in `docs/16_DEFINITION_OF_DONE.md` and the EPIC-specific acceptance criteria passes.
