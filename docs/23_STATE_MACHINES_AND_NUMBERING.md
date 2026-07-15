# State Machines and Numbering

Server/database transition guards are authoritative. UI options must be derived from the same approved rules.

## Inquiry

```text
new -> reviewing -> conflict_check -> accepted -> closed
new/reviewing/conflict_check -> declined -> closed
```

Original public submission is immutable; status and assignment change through audited actions.

## Intake

```text
new -> triage -> awaiting_information -> ready_for_conflict_check
ready_for_conflict_check -> conflict_review
conflict_review -> cleared | conditional | conflicted | deferred
cleared/conditional -> engagement_pending -> approved -> converted
any non-converted state -> declined/closed
```

## Conflict check

```text
draft -> searching -> review_required -> decision_recorded
review_required -> searching (new terms/version)
decision_recorded -> superseded (new decision version only)
```

## Matter

```text
prospective -> open
prospective -> declined
open -> on_hold -> open
open/on_hold -> closing_review -> closed -> archived
closed -> reopened (authorized reason)
```

`archived` is not deletion. Legal hold may apply in any non-destroyed state.

## Task

```text
open -> in_progress -> completed
open/in_progress -> blocked -> in_progress
open/in_progress/blocked -> cancelled
completed/cancelled -> reopened (authorized reason)
```

## Deadline

```text
draft -> pending_confirmation -> confirmed
confirmed -> revised (creates new current revision)
confirmed/revised -> satisfied | cancelled
```

## Document version availability

```text
pending_upload -> uploaded -> scanning -> available
uploaded/scanning -> rejected_invalid | rejected_malware | failed
```

## Document lifecycle

```text
draft -> review -> final -> executed -> archived
review -> draft
final -> superseded_by_new_version
```

Executed versions remain immutable.

## Portal membership

```text
invited -> active -> expired/revoked
invited -> expired/cancelled
```

## Invoice

```text
draft -> review -> approved -> issued
issued -> partially_paid -> paid
issued/partially_paid -> overdue
issued/partially_paid/paid -> corrected_by_credit_note
approved/issued -> void (authorized, rules apply)
```

## Export job

```text
requested -> awaiting_approval -> approved -> generating -> available -> expired
requested/awaiting_approval -> rejected
approved/generating -> failed
available -> revoked
```

## Security incident

```text
open -> triaged -> contained -> investigating -> recovering -> closed
closed -> reopened
```

## Numbering

Numbering is firm-configurable and transactionally reserved. Defaults are examples only:

- Matter: `BAT-{YYYY}-{000001}`
- Invoice: `INV-{YYYY}-{000001}`
- Receipt: `OR-{YYYY}-{000001}`
- Evidence: `{MATTER-NO}-E-{0001}`
- Export: `EXP-{YYYYMMDD}-{000001}`

Requirements:

- unique per firm and sequence type;
- no reuse after void/cancel;
- generated in database transaction;
- year reset only if configured;
- preview is non-binding; issuance reserves number.
