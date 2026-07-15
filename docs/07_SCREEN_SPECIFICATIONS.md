# Screen Specifications

Every screen needs loading, empty, error, permission-denied and success states; keyboard navigation; responsive layout; and test selectors for critical actions.

## Public site

### Home

- Premium legal-authority presentation using only approved content.
- Clear routes to inquiry and consultation request.
- No guarantees, rankings or unverified outcomes.
- Footer links to privacy and disclaimer.

### About / Practice Areas

- CMS-backed approved content.
- Draft content never leaks through metadata, static generation or API.
- Practice area cards remain hidden until approved descriptions exist.

### Inquiry form

Fields: full name, email, phone, preferred contact, subject, message, consent checkbox, hidden honeypot. Show relationship disclaimer before submit. Confirmation must not imply acceptance.

### Consultation request

Fields: identity/contact, preferred date, time window, mode, notes and consent. Requested slot is not confirmed until staff action.

## Staff dashboard

### Dashboard home

Widgets by permission:

- critical deadlines;
- overdue tasks;
- today’s events;
- new intakes;
- pending conflict decisions;
- documents awaiting review;
- billing attention;
- security alerts.

No cross-matter snippets without authorization.

### Unified inbox

Tabs: inquiries, consultation requests, portal requests and unassigned communications. Bulk actions are limited, audited and never include sensitive status decisions.

### Intake list and detail

List filters: status, owner, urgency, date and source. Detail includes original submission, structured parties, missing information, conflict status, notes and next action. Conversion button appears only when gates pass.

### Conflict review

- Search input snapshot.
- Candidate list grouped by contact, intake and matter.
- Match reasons and source links, permission-safe.
- Per-candidate disposition.
- Overall decision form with required reasoning.
- Decision history cannot be edited in place.

### Contacts/organizations

- Search, filters, duplicate indicators.
- Detail tabs: profile, aliases, contact methods, addresses, relationships, matters and audit.
- Merge workflow requires review and preview of affected references.

### Matter list

Columns: matter number, title, client, responsible lawyer, status, confidentiality, next deadline and updated date. Restricted matters reveal no title to unauthorized users.

### Matter overview

- Header with matter number, title, status, confidentiality and responsible lawyer.
- Next critical actions.
- Client and party summary.
- Recent chronology and communications.
- Billing summary only for authorized roles.
- Access warning for restricted matters.

### Parties

Add/link contact, party role, adversity, counsel/representation. Changes audited.

### Team and access

Member, role, access level, expiry and sponsor. Highly restricted changes require AAL2 and confirmation.

### Chronology

Date/time, event, significance, source documents and author. Entries can be corrected through revision history, not erased.

### Tasks

Board/list views; filters by assignee, status, priority and due date. Task drawer supports dependency and completion evidence.

### Deadlines/events

Calendar and agenda views. Deadline editor requires source and confirmation. Changes show revision history.

### Documents

Folder tree, list, filters, upload, version history, scan state, classification, status and sharing. Download action generates signed URL on demand.

### Communications

Internal and portal-visible threads visually distinct. Message composer shows audience before send. Sent message is immutable.

### Time/expenses

Daily/weekly time entry, timer optional, expense receipts, approval queue and unbilled status.

### Billing

Arrangement, retainer ledger, draft invoices, approvals, issued invoices, payments and receipts. Issued documents are immutable.

### Close matter

Checklist with blockers, final billing, portal revocation/continuation, retention and legal hold. Requires lawyer approval and reason.

## Client portal

### Portal home

Only shared matters and open requests. No staff-only dashboard data.

### Matter view

Approved status summary, appointments, shared documents, messages, requests and billing. No internal chronology unless explicitly transformed into client-facing updates.

### Document view

Version/title, share date, download, acknowledgment or signature request. Signed URLs expire.

### Messages

Portal-visible threads only. Clear warning that urgent matters should use approved office channels; wording requires firm approval.

### Requests

Upload requested items into quarantine. Show status and due date.

### Invoices

Issued invoices, balance, allocations and receipts. Payment action appears only after provider implementation and approval.

## Administration

### Users and roles

Invite, role, status, MFA state, matter assignments and last access review. Sensitive changes require AAL2.

### Security

Active sessions summary, external grants, emergency access, exports, incidents, backup state and integration health.

### Audit

Filter by actor, event, object, matter, date and outcome. Audit records are read-only and redact sensitive payloads.

### Firm settings

Identity, offices, timezone, numbering, practice areas, templates, billing, reminders, retention, privacy notices and integrations. Each setting group has explicit permission and audit behavior.

## Screen acceptance baseline

A screen is not complete unless:

- route is protected correctly;
- data query respects RLS and pagination;
- all intended mutations exist and are authorized;
- validation and concurrency behavior are visible;
- audit events are written;
- tests cover success and forbidden cases;
- empty/loading/error/permission states exist;
- no placeholder buttons or false “coming soon” claims remain in the delivered epic.
