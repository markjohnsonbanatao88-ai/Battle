# Server Actions and API Contracts

## General contract

Every protected mutation must:

1. Parse input using Zod or equivalent strict schema.
2. Verify authenticated user server-side.
3. Resolve active firm membership.
4. Verify role and matter/object permission.
5. Verify AAL2 where required.
6. Enforce idempotency for retried operations.
7. Perform authoritative mutation in a database transaction or secure RPC.
8. Write audit/event history in the same transaction when possible.
9. Return a typed success or safe error object.
10. Never return database internals, secrets or unauthorized object existence.

## Error envelope

```ts
interface ActionError {
  ok: false;
  code:
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'MFA_REQUIRED'
    | 'VALIDATION_FAILED'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'STALE_VERSION'
    | 'RATE_LIMITED'
    | 'DEPENDENCY_FAILED'
    | 'INTERNAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId: string;
}
```

Do not distinguish forbidden from nonexistent confidential objects in a way that leaks their existence.

## Query rules

- Prefer server components or server-side query functions.
- Select explicit columns; never use broad `select('*')` on sensitive screens.
- Pagination is mandatory for operational lists.
- Filters are validated and bounded.
- Export is a separate approved workflow, not “fetch all.”
- Search uses permission-enforced database functions or tables.

## Required action families

### Identity and administration

- `inviteFirmMember`
- `acceptFirmInvitation`
- `changeMembershipRole`
- `disableFirmMember`
- `revokeUserSessions`
- `grantExternalMatterAccess`
- `revokeExternalMatterAccess`
- `requestEmergencyMatterAccess`

### Intake and conflict

- `triageInquiry`
- `createIntakeFromInquiry`
- `updateIntake`
- `submitConflictCheck`
- `reviewConflictCandidate`
- `recordConflictDecision`
- `approveEngagement`
- `convertIntakeToMatter`

### Contacts

- `createContact`
- `updateContact`
- `addContactAlias`
- `createContactRelationship`
- `proposeContactMerge`
- `approveContactMerge`

### Matters

- `createMatter`
- `updateMatter`
- `changeMatterStatus`
- `assignResponsibleLawyer`
- `addMatterParty`
- `addMatterMember`
- `changeMatterMemberAccess`
- `removeMatterMember`
- `closeMatter`
- `reopenMatter`

### Tasks/calendar

- `createTask`
- `updateTask`
- `completeTask`
- `createDeadline`
- `confirmDeadline`
- `reviseDeadline`
- `createEvent`
- `updateEvent`
- `acknowledgeReminder`

### Documents/evidence

- `createUploadSession`
- `finalizeUploadedVersion`
- `createDocumentVersion`
- `changeDocumentStatus`
- `createSignedDownloadUrl`
- `shareDocumentWithPortalUser`
- `revokeDocumentShare`
- `registerEvidenceItem`
- `recordEvidenceCustodyEvent`
- `generateDocumentFromTemplate`

### Portal/communications

- `invitePortalUser`
- `revokePortalUser`
- `createPortalThread`
- `sendMatterMessage`
- `createClientRequest`
- `completeClientRequest`
- `acknowledgePortalObject`

### Billing

- `createTimeEntry`
- `approveTimeEntry`
- `createExpenseEntry`
- `approveExpenseEntry`
- `createDraftInvoice`
- `issueInvoice`
- `voidInvoice`
- `recordManualPayment`
- `reconcileProviderPayment`
- `issueReceipt`

### Security/operations

- `requestExport`
- `approveExport`
- `createExportDownloadUrl`
- `placeLegalHold`
- `releaseLegalHold`
- `openSecurityIncident`
- `resolveSecurityIncident`

## Optimistic concurrency

Updates to matters, tasks, documents, billing configuration and other mutable records include `expectedRowVersion`. Database functions update only when current version matches and increment it atomically. Mismatch returns `STALE_VERSION` with no silent overwrite.

## Idempotency

Public submissions, intake conversion, uploads, invoice issuance, payments and notification dispatch use caller-generated idempotency keys stored with result references.

## Audit event naming

Use stable dotted names:

```text
intake.created
conflict.decision_recorded
matter.opened
matter.access_granted
deadline.revised
document.version_uploaded
document.shared
invoice.issued
payment.reconciled
security.emergency_access_used
export.downloaded
```

Audit metadata contains identifiers and redacted diffs, not document bodies or secrets.
