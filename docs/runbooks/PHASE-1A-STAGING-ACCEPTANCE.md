# Phase 1A Staging and Office Acceptance Runbook

## Purpose

Use this runbook before merging or deploying the Phase 1A workflow:

`Public inquiry → staff review → party capture → conflict warning → lawyer decision → consultation scheduling`

All records used for acceptance must be synthetic. Do not use a real client, opposing party, case, document, telephone number or email address.

## Prepare a disposable environment

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

Every acceptance session must record the date, staging environment, build commit, reviewer and result. Screenshots must contain synthetic data only.

## Gate A — Public inquiry

1. Open the public inquiry form on desktop and mobile width.
2. Confirm the no-attorney-client-relationship statement appears before submission.
3. Submit a synthetic inquiry using a `.test` address.
4. Confirm the user sees only a random `INQ-...` reference.
5. Confirm no internal `BAT-I-...` reference appears in the response, page source or browser network payload.
6. Repeat submissions from one synthetic fingerprint until the durable hourly limit rejects the excess request safely.
7. Confirm malformed data and honeypot submissions do not create an inquiry.

Evidence:

- public-form screenshot;
- redacted network response showing only the public reference;
- database query showing a separate internal reference;
- CI public-route and pgTAP results.

## Gate B — Secretary intake preparation

1. Sign in as Synthetic Secretary.
2. Open the inquiry queue and confirm the new inquiry has one obvious next action.
3. Open the seeded `Synthetic Acceptance Prospect` inquiry.
4. Start intake with urgency, jurisdiction and missing-information notes.
5. Add `Opposing Holdings` as an adverse organization and add one other related synthetic party.
6. Add an alias to one party.
7. Confirm the original public submission remains unchanged and visually separate from staff-entered information.
8. Print or preview the packet and confirm the original submission, parties and both office references are readable.

Expected result:

- secretary can prepare information;
- secretary cannot see or use lawyer-decision controls;
- large controls remain usable without horizontal scrolling at common desktop and tablet widths.

## Gate C — Conflict warnings and legal authority

1. Run the conflict search as Synthetic Secretary after adding `Opposing Holdings`.
2. Confirm warning candidates identify the existing contact and prior matter-party sources with human-readable reasons.
3. Sign in as Synthetic Technical Admin.
4. Confirm lawyer review and overall decision controls are absent.
5. Attempt the controlled decision RPC as Synthetic Technical Admin and confirm PostgreSQL rejects it.
6. Sign in as Synthetic Associate or Partner.
7. Review every warning with a written reason.
8. Attempt to record the overall decision while one warning remains unreviewed and confirm it is blocked.
9. Finish every warning and record a written disposition.
10. Attempt to update or delete the decision and confirm the append-only trigger rejects it.

Expected result:

- automated search never declares a legal conflict;
- technical administration is not treated as legal authority;
- lawyer reasoning, identity and time are retained permanently.

## Gate D — Consultation scheduling

1. Attempt to schedule the uncleared synthetic inquiry and confirm it is blocked.
2. Record a cleared or conditional lawyer decision.
3. Schedule a consultation in Philippine time as Synthetic Secretary.
4. Confirm only active managing partners, partners and associates appear in the lawyer selector.
5. Attempt an overlapping appointment for the same lawyer.
6. Confirm the screen shows a safe warning and the PostgreSQL exclusion constraint rejects the overlap.
7. Confirm the consultation appears in the seven-day Command Center list.

## Gate E — Executive Command Center

1. Confirm the seed's urgent task appears in the count.
2. Leave one intake in staff preparation and one conflict check waiting for lawyer review.
3. Open the Command Center as each staging role.
4. Confirm counts reconcile with the underlying queues.
5. Confirm the lawyer-decision queue links directly to the correct inquiry.
6. Confirm the staff-intake queue shows urgency, office reference, client name, subject and current stage.
7. Confirm later unimplemented modules are not represented as live data.
8. Print the office summary and confirm interactive buttons do not appear on paper.

## Gate F — Cross-firm isolation

1. Sign in as Other Firm User.
2. Try direct URLs for the first firm's inquiry and dashboard records.
3. Try selecting the first firm's intake, conflict check, candidate and decision IDs through the Data API.
4. Confirm no title, name, subject, status or existence detail is exposed.

## Gate G — Withdrawal and restore rehearsal

The CI database job performs this automatically on a disposable local Supabase instance:

1. Run `supabase/rollback/phase1a_feature_withdrawal.sql`.
2. Verify public submission and authenticated Phase 1A mutation execution privileges are absent.
3. Verify authenticated reads of the new conflict tables are absent.
4. Confirm no row or table is deleted.
5. Run `supabase/rollback/phase1a_feature_restore.sql`.
6. Verify the reviewed grants are restored.
7. Rerun the complete database and RLS suite if the rehearsal is performed outside CI.

Production withdrawal requires an approved incident/change record and must preserve all original inquiries, decisions and audit history.

## Print/PDF inspection checklist

Inspect A4 portrait output using the browser's print preview and one saved PDF:

- no sidebar, navigation or action buttons;
- no clipped names, references, reasons or conditions;
- original submission clearly labeled;
- parties and adverse status readable;
- conflict warning reasons readable;
- decision history includes reviewer and timestamp;
- consultation time explicitly reflects Philippine time;
- page breaks do not separate a heading from all of its content;
- confidential staging packet is not uploaded to a public issue or external service.

## Acceptance record

| Field | Value |
|---|---|
| Staging URL | |
| Commit SHA | |
| Test date | |
| Secretary reviewer | |
| Lawyer reviewer | |
| Technical reviewer | |
| Print/PDF reviewer | |
| Result | `PASS` / `FAIL` |
| Findings or approved exceptions | |

The PR must remain draft when any gate is untested or failed. A passed automated CI run does not replace the old-school office-user and print/PDF review.
