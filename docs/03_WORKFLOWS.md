# End-to-End Workflows

## WF-01 Public inquiry to structured intake

1. Public user submits inquiry with consent version, timestamp, IP risk metadata and bot checks.
2. System creates immutable original submission and audit event.
3. Intake staff triages urgency and duplicate possibility.
4. Staff creates or links a contact and opens a prospective-client intake.
5. Staff records prospective client, adverse parties, related entities, summary, jurisdiction, deadlines and referral source.
6. Intake status moves `new -> triage -> awaiting_information -> ready_for_conflict_check` as applicable.
7. No attorney-client relationship or legal advice is represented before engagement approval.

Failure rules:

- Repeated submission uses idempotency and duplicate indicators.
- Sensitive attachments are quarantined and not broadly visible.
- Suspected emergency language is surfaced to staff; the system does not give emergency legal advice.

## WF-02 Conflict checking

1. Intake staff submits a normalized conflict-check request.
2. System expands search terms using names, aliases, organizations, officers, related entities and party roles.
3. Search runs against contacts, aliases, relationships, prior intakes and matter parties within authorized firm data.
4. Results are scored as candidates with reasons; no automatic clearance or conflict determination.
5. Reviewing lawyer marks each candidate `not_relevant`, `potential`, `confirmed` or `needs_more_information`.
6. Lawyer records overall disposition: `cleared`, `cleared_with_conditions`, `waiver_required`, `conflict_confirmed`, or `deferred`.
7. Decision requires reasoning, reviewer and timestamp. Changes create a new decision version.
8. Only cleared/conditionally cleared intake can proceed to engagement approval.

## WF-03 Engagement approval and matter opening

1. Authorized lawyer confirms conflict disposition.
2. Staff selects engagement arrangement and generates approved engagement documents from a versioned template.
3. Required signatures/acknowledgments are recorded.
4. Authorized lawyer approves opening.
5. Transaction creates matter, matter number, client party, adverse parties, responsible lawyer, initial team, initial tasks and audit events.
6. Intake becomes `converted`; original intake remains linked and immutable.
7. Matter remains `prospective` until all opening checks pass, then transitions to `open`.

Opening checklist defaults:

- conflict decision complete;
- client identity/contact record complete;
- engagement terms recorded;
- responsible lawyer assigned;
- confidentiality level assigned;
- critical deadlines entered and confirmed;
- initial document folder created;
- portal decision recorded.

## WF-04 Matter lifecycle

Allowed transitions:

```text
prospective -> open
prospective -> declined
open -> on_hold
on_hold -> open
open/on_hold -> closing_review
closing_review -> closed
closed -> reopened (authorized, reason required)
closed -> archived (retention policy)
```

Every transition records actor, reason, timestamp and prior/new status. Restricted matters require an explicit team allowlist.

## WF-05 Matter team and access

1. Matter manager invites an active firm member or external collaborator.
2. Select access `viewer`, `contributor`, or `manager` and optional expiry.
3. Highly restricted matters require explicit confirmation and AAL2.
4. Access change is audited and invalidates relevant caches/signed links where necessary.
5. Removing a member does not delete their historical authorship.

## WF-06 Task and deadline management

1. User creates task/event linked to matter.
2. For a legal deadline, record source document/event, source date, calculation note, owner and confirmation status.
3. Reviewer confirms deadline before it is treated as authoritative.
4. Reminder schedule is generated according to severity.
5. Changes require reason and preserve history.
6. Completion records completion evidence and reviewer when required.
7. Overdue critical items escalate to responsible lawyer and managing partner.

## WF-07 Document upload and versioning

1. Authorized user requests upload session.
2. Server creates pending version record and approved storage path.
3. Client uploads to private storage.
4. Server verifies object metadata, size and path; asynchronous scanner marks malware state.
5. Hash is calculated and stored.
6. Version becomes available only after scan passes.
7. New versions never overwrite prior objects.
8. Final/executed status requires authorized approval.

## WF-08 Evidence chain of custody

1. Create evidence item with source, collector, acquisition method and timestamp.
2. Upload immutable original; calculate hash.
3. Record each custody/access/export/transfer event.
4. Working copies are separate derivative versions linked to original.
5. Any hash mismatch creates a security incident and blocks reliance until reviewed.

## WF-09 Client portal sharing

1. Staff identifies client contact and matter.
2. Authorized user invites portal user with expiry and approved matter scope.
3. Portal user verifies identity and accepts portal terms.
4. Staff explicitly shares individual document/message/request/invoice objects.
5. Client access is logged; critical items can require acknowledgment.
6. Revocation ends active sessions and prevents new signed URLs.

## WF-10 Secure communication

- Each thread belongs to a matter and visibility group.
- Internal threads never appear in portal.
- Client messages are immutable after send; corrections are new messages.
- Attachments follow document quarantine and authorization rules.
- Email capture stores normalized metadata and approved body/attachment copies without relying on external mailbox permanence.

## WF-11 Time and expense to invoice

1. Staff records time/expense against matter.
2. Reviewer approves, rejects or returns entries.
3. Billing run selects approved unbilled entries and applicable arrangement/rates.
4. Draft invoice is calculated and reviewed.
5. Issuance freezes line items and assigns invoice number.
6. Client receives portal share or approved delivery.
7. Payment is reconciled from verified provider event or authorized manual record.
8. Corrections use credit note, void or replacement; issued invoice is not silently edited.

## WF-12 Matter closing

1. Responsible lawyer starts closing review.
2. Complete checklist: final status, client communication, final documents, outstanding tasks, deadlines, property/evidence, billing, retainer balance, portal access, retention class and legal hold.
3. Authorized lawyer approves closure.
4. Matter becomes read-only except permitted post-close actions.
5. Retention timer starts only when policy allows; legal hold overrides destruction.

## WF-13 User offboarding

1. Admin identifies departing user and effective time.
2. Reassign matters, tasks, consultations and approvals.
3. Disable membership and revoke sessions.
4. Remove external integrations and keys.
5. Preserve authorship and audit records.
6. Review recent exports, downloads and anomalous access.
7. Document completion and responsible approver.

## WF-14 Security incident

1. Detect and create incident record.
2. Contain sessions, access, credentials or integration.
3. Preserve logs and evidence.
4. Assess affected records and risk.
5. Determine legal notification obligations through authorized privacy/legal review.
6. Recover from verified clean state.
7. Record post-incident actions and prevention items.
