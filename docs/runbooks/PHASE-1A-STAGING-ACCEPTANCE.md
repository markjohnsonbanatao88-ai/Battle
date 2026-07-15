# Phase 1A Staging and Office Acceptance Runbook

## Purpose

Use this runbook before merging or deploying the Phase 1A workflow:

`Public inquiry → staff review → party capture → conflict warning → lawyer decision → consultation scheduling`

All records used for acceptance must be synthetic. Do not use a real client, opposing party, case, document, telephone number or email address.

## Approved zero-cost split-staging pathway

When no isolated hosted Supabase database is available and creating one would require an upgrade, use the repository's split-staging pathway instead of touching the default `Battle` database:

### Database and authorization lane

GitHub Actions starts a disposable local Supabase instance and executes:

- every repository migration;
- every PostgreSQL pgTAP and RLS suite;
- lawyer-only authority assertions;
- technical-admin denial assertions;
- append-only conflict-decision protection;
- clearance and lawyer-overlap scheduling gates;
- cross-firm isolation;
- non-destructive feature withdrawal and restoration;
- `supabase/staging/phase1a_acceptance_seed.sql` validation.

This lane is authoritative for database behavior. It is destroyed after the workflow and never receives live data.

### Whole-office and print lane

`acceptance/phase1a/index.html` is a standalone synthetic office simulator. It contains no Supabase URL, key, password, cookie, production record or network mutation. It provides:

- secretary view;
- lawyer review and decision view;
- technical-admin denial view;
- Executive Command Center queues;
- intake and conflict-warning review;
- clearance-gated scheduling;
- printable intake/conflict/consultation packet.

The browser CI job runs `scripts/capture-phase1a-acceptance.mjs` and uploads the `phase1a-office-acceptance` artifact containing:

- the standalone HTML simulator;
- secretary Command Center screenshot;
- secretary inquiry screenshot;
- lawyer conflict-review screenshot;
- lawyer-cleared scheduling screenshot;
- technical-admin denial screenshot;
- printable packet screenshot;
- A4 PDF packet.

This artifact is the approved zero-cost surface for secretary, lawyer, technical-admin and print/PDF review. It does **not** claim that the application is deployed end to end. Live deployment acceptance remains a separate release gate before production use.

## Optional isolated hosted environment

Use this only when a genuinely isolated environment already exists at no additional cost or has separate approval:

1. Use a local or isolated staging Supabase project. Never seed the production project.
2. Apply all repository migrations in order.
3. Apply `supabase/staging/phase1a_acceptance_seed.sql`.
4. Configure the application to use the seeded `batalla-associates` firm.
5. In Supabase Auth, assign temporary staging-only passwords or approved magic links to the `.test` users. Do not commit passwords or links.
6. After acceptance, reset or destroy the disposable environment. Do not weaken the append-only decision trigger merely to clean up staging rows.

The seed provides:

- secretary, technical-admin, associate, partner and other-firm identities;
- one synthetic new inquiry;
- one existing organization and restricted matter party named `Opposing Holdings` for an exact conflict warning;
- one urgent synthetic task for the Command Center.

The seed is idempotent for its deterministic records, but the manual workflow creates additional rows. Environment reset is the approved cleanup method.

## Required staging identities

Use separate synthetic users so role boundaries are visible:

| Identity | Membership role | Expected authority |
|---|---|---|
| Synthetic Secretary | `legal_secretary` | Prepare intake, add parties, run search and schedule after clearance |
| Synthetic Technical Admin | `firm_admin` | Administer technology; no lawyer conflict decision controls |
| Synthetic Associate | `associate` | Review candidates and record lawyer decision |
| Synthetic Partner | `partner` | Review candidates and record lawyer decision |
| Other Firm User | `partner` in a second synthetic firm | No access to the first firm's intake or conflict records |

Every acceptance session must record the date, staging surface, build commit, reviewer and result. Screenshots must contain synthetic data only.

## Gate A — Public inquiry

1. Open the public inquiry form on desktop and mobile width.
2. Confirm the no-attorney-client-relationship statement appears before submission.
3. Submit a synthetic inquiry using a `.test` address when an isolated hosted environment is available.
4. Confirm the user sees only a random `INQ-...` reference.
5. Confirm no internal `BAT-I-...` reference appears in the response, page source or browser network payload.
6. Repeat submissions from one synthetic fingerprint until the durable hourly limit rejects the excess request safely.
7. Confirm malformed data and honeypot submissions do not create an inquiry.

Zero-cost evidence:

- public Playwright smoke test;
- public-route integration tests;
- pgTAP public-reference and rate-limit assertions;
- the existing healthy public preview for visual review where available.

A standalone simulator does not replace the public request/response tests.

## Gate B — Secretary intake preparation

1. Open the `phase1a-office-acceptance` artifact.
2. Open `index.html` in a current browser.
3. Select **Secretary** and **Inquiry Review**.
4. Confirm the inquiry has one obvious next action.
5. Confirm urgency, jurisdiction, missing information and ownership are easy to read.
6. Confirm prospective client, opposing party, organization, alias and relationship information are visibly separated.
7. Confirm the original public submission is visibly immutable and separate from staff-entered information.
8. Open **Printable Packet** and confirm the original submission, parties and both office references are readable.

Expected result:

- secretary can understand and prepare information;
- secretary does not see lawyer-decision controls;
- large controls remain usable without horizontal scrolling at common desktop and tablet widths.

## Gate C — Conflict warnings and legal authority

1. In the artifact, select **Secretary** and confirm warnings are labeled as warnings only.
2. Select **Technical Admin** and confirm lawyer review and overall decision controls are absent.
3. Review the CI database result proving the controlled decision RPC rejects technical-admin authority.
4. Select **Lawyer**.
5. Confirm every warning has a match source and human-readable reason.
6. Use **Review both warnings** and confirm the permanent-decision control remains logically separated from candidate review.
7. Record the simulator's lawyer disposition and confirm the scheduling gate opens.
8. Review CI evidence that an unreviewed warning blocks the actual database decision.
9. Review CI evidence that the actual database decision cannot be updated or deleted.

Expected result:

- automated search never declares a legal conflict;
- technical administration is not treated as legal authority;
- lawyer reasoning, identity and time are retained by the real database implementation.

## Gate D — Consultation scheduling

1. In Secretary view, confirm scheduling is shown as locked before clearance.
2. In Lawyer view, review warnings and record synthetic clearance.
3. Confirm the simulator opens the scheduling action only after clearance.
4. Confirm lawyer, method, start and end are readable in Philippine time.
5. Review CI evidence that only active lawyer-position memberships are selectable by the actual database function.
6. Review CI evidence that an overlapping appointment is rejected by PostgreSQL.

## Gate E — Executive Command Center

1. Select **Command Center**.
2. Confirm the lawyer-decision queue links directly to the correct inquiry.
3. Confirm the staff-intake queue shows urgency, office reference, client name, subject and current stage.
4. Confirm an urgent task and upcoming consultation are visible.
5. Confirm later unimplemented modules are not represented as live data.
6. Confirm the page is readable in the secretary, lawyer and technical-admin role views.

## Gate F — Cross-firm isolation

The static simulator intentionally contains no live tenant records. Cross-firm isolation is therefore accepted only from the disposable Supabase CI suites:

1. Other-firm user cannot select the first firm's inquiry, intake, conflict check, candidate or decision.
2. Direct identifiers do not disclose title, name, subject, status or existence details.
3. RLS and controlled RPC checks remain green on the exact PR head.

Do not claim that visual simulator review proves cross-firm isolation.

## Gate G — Withdrawal and restore rehearsal

The CI database job performs this automatically on a disposable local Supabase instance:

1. Run `supabase/rollback/phase1a_feature_withdrawal.sql`.
2. Verify public submission and authenticated Phase 1A mutation execution privileges are absent.
3. Verify authenticated reads of the new conflict tables are absent.
4. Confirm no row or table is deleted.
5. Run `supabase/rollback/phase1a_feature_restore.sql`.
6. Verify the reviewed grants are restored.
7. Validate the synthetic seed after restoration.

Production withdrawal requires an approved incident/change record and must preserve all original inquiries, decisions and audit history.

## Print/PDF inspection checklist

Open the artifact's PDF and inspect A4 portrait output:

- no sidebar, navigation or action buttons;
- no clipped names, references, reasons or conditions;
- original submission clearly labeled;
- parties and adverse status readable;
- conflict warning reasons readable;
- decision history includes reviewer and timestamp;
- consultation time explicitly reflects Philippine time;
- page breaks do not separate a heading from all of its content;
- the packet is explicitly labeled synthetic;
- the artifact is not treated as a real client file.

## Acceptance record

| Field | Value |
|---|---|
| Acceptance surface | `phase1a-office-acceptance` artifact / isolated hosted staging |
| Commit SHA | |
| GitHub Actions run | |
| Test date | |
| Secretary reviewer | |
| Lawyer reviewer | |
| Technical reviewer | |
| Print/PDF reviewer | |
| Result | `PASS` / `FAIL` |
| Findings or approved exceptions | |

The PR must remain draft when any mandatory gate is untested or failed. The zero-cost split-staging pathway provides genuine database evidence plus genuine office/print evidence, but it does not by itself prove production deployment readiness.
