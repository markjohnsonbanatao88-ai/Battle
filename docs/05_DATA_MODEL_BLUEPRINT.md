# Data Model Blueprint

## Global conventions

Every mutable firm-owned table should include:

```text
id uuid primary key
firm_id uuid not null
created_at timestamptz not null
created_by uuid
updated_at timestamptz not null
updated_by uuid
row_version bigint not null default 1
archived_at timestamptz null
```

- Use composite foreign keys including `firm_id` where feasible to prevent cross-tenant linkage.
- Use `numeric`, not floating point, for money.
- Use immutable append-only history tables for decisions, status changes and financial ledger events.
- Use `citext` or normalized helper columns for case-insensitive identity/search fields after migration review.
- Do not store document binaries in PostgreSQL; store private object paths and metadata.

## Existing foundation tables

- `firms`
- `profiles`
- `firm_memberships`
- `inquiries`
- `consultation_requests`
- `site_content`
- `audit_events`
- `contacts`
- `contact_aliases`
- `matters`
- `matter_memberships`
- `matter_parties`
- `tasks`
- `documents`
- `document_versions`

These tables must be migrated additively toward the target model; do not rewrite production migration history.

## Target identity and administration

### `office_locations`

Firm offices, timezone, public/private address flags and active state.

### `role_permissions`

Optional database-driven permission overrides only after a stable static permission model exists. Do not use this to bypass RLS review.

### `membership_security`

MFA requirement state, last access review, employment dates and offboarding metadata.

### `external_access_grants`

Matter scope, access level, reason, sponsor, start and expiry.

### `emergency_access_events`

Requested matter, reason, approver, start/end, actions and review status.

## Contacts and relationships

### Extend `contacts`

Add normalized name, person/organization-specific profile reference, confidentiality, source and merge status.

### `person_details`

Birth date only when necessary, nationality only when necessary, occupation, government-ID reference token—not unrestricted ID images.

### `organization_details`

Legal name, trade names, registration type/number, jurisdiction and industry.

### `contact_methods`

Type, value, label, primary flag, verification and consent state.

### `addresses`

Structured address, usage type, valid-from/to and source.

### `contact_relationships`

Directed relationship type, start/end, notes and source; supports officer, director, employee, spouse, representative, subsidiary and parent relationships.

### `contact_merge_events`

Winning contact, merged contact, reviewer and mapping. References remain traceable.

## Intake and conflicts

### `intakes`

Source inquiry, prospective client contact, summary, urgency, jurisdiction, status, owner and decision timestamps.

### `intake_parties`

Contact, proposed role, adverse flag and relationship note.

### `conflict_checks`

Input snapshot, requested by, status and search version.

### `conflict_search_terms`

Normalized searched names/entities and source.

### `conflict_candidates`

Matched object, score, match reasons and snapshot.

### `conflict_candidate_reviews`

Candidate disposition and reviewer reasoning.

### `conflict_decisions`

Append-only overall decision version, disposition, conditions/waiver reference, lawyer reviewer and timestamp.

### `engagements`

Engagement type, scope, terms version, signature state, approved by and effective dates.

### `intake_conversions`

Idempotency key and linked created matter.

## Matters

### Extend `matters`

Add client contact, matter type, summary, jurisdiction, court/agency, branch, docket/reference, responsible lawyer, originating lawyer, confidentiality, billing arrangement, close reason and row version.

### `matter_status_events`

Append-only old/new status, reason, actor and timestamp.

### `matter_roles`

Configurable party/counsel/witness role vocabulary.

### `matter_team_events`

Membership additions, changes, removals and expiry history.

### `matter_notes`

Type, visibility, classification, author and immutable edit history.

### `matter_chronology_events`

Occurred-at, title, facts, source references, significance and author.

### `matter_custom_field_definitions` / `matter_custom_field_values`

Firm-controlled fields with type validation.

### `matter_closing_checklists`

Checklist version, items, completion evidence and approval.

### `legal_holds`

Matter/document scope, reason, authority, start/end and release approval.

## Tasks, deadlines and calendar

### Extend `tasks`

Add row version, task type, dependency state, estimated effort, completion evidence and recurrence reference.

### `task_dependencies`

Predecessor/successor and dependency type.

### `task_status_events`

Append-only history.

### `events`

Matter, event type, start/end, timezone, location, remote link, source and organizer.

### `event_attendees`

Contact/user/portal attendee, role and response.

### `deadlines`

Matter, source, source date, due date, calculation note, confirmation state, confirmer and severity.

### `deadline_revisions`

Append-only change history.

### `reminder_rules` / `reminder_instances`

Configured offsets, channels, recipients, sent/acknowledged/escalated states.

### `calendar_connections`

Encrypted provider token reference, owner, sync scope and status. Secrets remain outside normal table reads.

## Documents, evidence and templates

### Extend `documents`

Add folder, type, privilege state, owner, retention class, legal-hold flag and row version.

### Extend `document_versions`

Add malware status, OCR status, checksum verification, source version and immutable metadata.

### `document_folders`

Matter-scoped hierarchy with stable IDs.

### `document_tags` / `document_tag_links`

Firm-owned tags.

### `document_access_events`

Download, preview, share, revoke and export events.

### `document_shares`

Recipient/portal user, expiry, permissions, revoked state and reason.

### `evidence_items`

Evidence identifier, source, collector, acquired-at, original version and integrity state.

### `evidence_custody_events`

Append-only possession/access/export/transfer log.

### `document_templates` / `document_template_versions`

Approved templates, variables, version and approver.

### `document_generation_jobs`

Template version, input snapshot, result version, status and approver.

### `signature_requests`

Provider reference, signers, status and final executed version.

## Communications and portal

### `communication_threads`

Matter, visibility (`internal`, `portal`), subject and state.

### `communication_messages`

Immutable sent messages, author type, body, delivery state and reply linkage.

### `message_attachments`

References to quarantined/approved document versions.

### `email_records`

External message ID, headers, normalized sender/recipients, captured content and matter link.

### `portal_users`

Auth user linkage and contact identity.

### `portal_memberships`

Matter, portal user, state, invited/accepted/expiry/revoked metadata.

### `portal_shares`

Explicit object shares and permissions.

### `client_requests`

Requested information/document, due date, assignee and completion.

### `portal_acknowledgments`

Object, version, user, timestamp and optional signature evidence.

## Billing and financials

### `billing_arrangements`

Matter, type, currency, rates/fee configuration, effective dates and approval.

### `rate_cards` / `rate_card_entries`

Role/user/activity rates with effective dates.

### `time_entries`

Matter, user, work date, duration minutes, narrative, rate snapshot, billable and approval state.

### `expense_entries`

Matter, amount numeric, tax, category, payee, receipt document, approval and reimbursement state.

### `retainer_accounts`

Matter/client, currency and status.

### `retainer_ledger_entries`

Append-only credit/debit/adjustment with resulting balance calculated transactionally.

### `invoices`

Invoice number, client, issue/due dates, status, currency, totals and immutable issued snapshot.

### `invoice_items`

Type, source entry, description, quantity, rate, tax and amount.

### `credit_notes`

Issued corrections linked to invoice.

### `payments`

Amount, date, method, provider reference/manual reconciliation, received by and verification state.

### `payment_allocations`

Payment allocation across invoices.

### `receipts`

Receipt number and immutable issued snapshot.

## Audit, privacy and operations

### Extend `audit_events`

Add request ID, IP risk metadata, user agent hash, action, object classification, before/after redacted diffs and outcome. Never store secrets or full document contents.

### `export_jobs`

Scope, reason, requester, approver, status, file path, expiry and download count.

### `privacy_consents`

Subject, notice version, purpose, captured-at and withdrawal state.

### `data_subject_requests`

Request type, identity verification, workflow and response record.

### `retention_rules` / `retention_assignments`

Approved retention class and disposition rules.

### `security_incidents`

Severity, status, timeline, affected scope and review.

### `integration_connections`

Provider, scope, secret reference, state and owner; no raw secrets.

### `notification_deliveries`

Channel, recipient, template, status and provider reference.

## Indexing and search

- Compound indexes begin with `firm_id` and status/due date for operational queues.
- Matter-child indexes include `matter_id` and common ordering fields.
- Conflict-search normalization uses approved generated columns or search tables.
- Full-text/OCR indexes must preserve RLS; do not copy searchable confidential text to an unprotected external index.

## Migration requirements

- One focused additive migration per epic.
- Include RLS policies, grants, indexes, comments and rollback strategy.
- Add SQL tests for positive and negative access paths.
- Backfill in bounded jobs; do not lock large tables without review.
