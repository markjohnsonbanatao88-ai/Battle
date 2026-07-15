# Information Architecture

## Global application structure

### Public routes

- `/` Home
- `/about`
- `/practice-areas`
- `/contact`
- `/inquiry`
- `/book`
- `/privacy`
- `/disclaimer`
- `/auth/*`

### Staff routes

- `/dashboard`
- `/dashboard/inbox` — unified inquiries, consultation requests and client requests
- `/dashboard/intakes`
- `/dashboard/conflicts`
- `/dashboard/contacts`
- `/dashboard/organizations`
- `/dashboard/matters`
- `/dashboard/matters/[matterId]/*`
- `/dashboard/calendar`
- `/dashboard/tasks`
- `/dashboard/documents`
- `/dashboard/communications`
- `/dashboard/time`
- `/dashboard/billing`
- `/dashboard/reports`
- `/dashboard/content`
- `/dashboard/admin/users`
- `/dashboard/admin/security`
- `/dashboard/admin/audit`
- `/dashboard/admin/settings`

### Client portal routes

Use a visually and technically separate route group:

- `/portal`
- `/portal/matters`
- `/portal/matters/[matterId]`
- `/portal/documents`
- `/portal/messages`
- `/portal/appointments`
- `/portal/requests`
- `/portal/invoices`
- `/portal/profile`

## Matter workspace tabs

1. Overview
2. Parties
3. Team and Access
4. Chronology
5. Tasks
6. Deadlines and Events
7. Documents
8. Communications
9. Time and Expenses
10. Billing
11. Client Sharing
12. Audit
13. Close Matter

Tabs must be permission-aware. A hidden tab is not authorization; database policies remain authoritative.

## Object hierarchy

```text
Firm
├── Office locations
├── Members and roles
├── Public content
├── Contacts and organizations
├── Intakes and conflict checks
├── Matters
│   ├── Parties
│   ├── Matter members
│   ├── Events/deadlines
│   ├── Tasks
│   ├── Notes/chronology
│   ├── Documents/evidence
│   ├── Communications
│   ├── Time/expenses
│   ├── Invoices/payments
│   └── Portal shares
└── Audit/security/operations
```

## Global search

Search is permission-filtered and grouped by entity:

- Matters: number, title, docket/reference, court/agency.
- Contacts: name, alias, organization, email, phone.
- Documents: title, tags, OCR text only where authorized.
- Tasks/events: title and matter.
- Communications: subject and approved searchable text.
- Invoices: invoice number, client and matter.

Search results must never expose snippets for unauthorized objects. Conflict search is separate from normal search because it has broader approved access and special logging.

## Dashboard information priority

1. Critical deadlines within 48 hours.
2. Overdue tasks and unacknowledged escalations.
3. Today’s hearings and consultations.
4. Conflict checks awaiting lawyer decision.
5. New prospective-client submissions.
6. Documents awaiting review/signature.
7. Unbilled time and overdue invoices according to role.
8. Recent security alerts.

## Naming conventions

- Use “Matter,” not “Case,” as the broad object; litigation matters may have docket/case numbers.
- Use “Contact” for person/organization CRM records.
- Use “Prospective Client Intake” before engagement.
- Use “Client Portal” only after approved engagement and invitation.
- Use “Archive” or “Close,” not delete, for legal records.
