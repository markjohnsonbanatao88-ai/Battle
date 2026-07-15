# Client Portal Blueprint

## Boundary

The portal is a controlled collaboration surface, not a mirror of the internal matter workspace.

## Identity

- Portal users are linked to contacts.
- Invitation identifies matter and permitted relationship.
- Invitation expires and is single-use.
- Acceptance records portal terms/privacy notice version.
- Staff and portal memberships use separate tables and RLS functions.

## Allowed objects

- client-facing matter summary;
- explicitly shared documents and document versions;
- portal-visible message threads;
- appointments where the client is a participant;
- information/document requests;
- issued invoices and receipts explicitly shared;
- acknowledgment/signature requests.

## Never exposed

- internal notes;
- conflict searches/decisions;
- internal strategy;
- internal task lists unless transformed into a client request;
- other clients, contacts or matters;
- staff billing rates unless included in issued documents;
- audit/security records;
- privileged documents not explicitly approved for sharing.

## Sharing lifecycle

```text
proposed -> approved -> active -> expired/revoked
```

Approver, recipient, object version, permissions and expiry are recorded. Updating an internal document does not automatically change the version shared with the client.

## Secure messages

- Thread is matter-scoped and explicitly portal-visible.
- Audience is displayed before send.
- Sent messages cannot be edited; corrections are follow-up messages.
- Delivery and read status are recorded where available.
- Attachments are quarantined and approved before internal availability.

## Client requests

Staff can request documents, information, acknowledgment or action with due date. Client submission is tracked and reviewed; completion does not automatically certify correctness.

## Revocation and closure

Revocation:

- disables portal membership;
- revokes active application sessions;
- blocks new signed URLs;
- records reason and actor;
- preserves past audit and acknowledgments.

Matter closure follows approved portal continuation/revocation policy and does not silently remove previously issued receipts or documents that must remain available.

## Portal security tests

- portal user cannot enumerate firm contacts or other matters;
- portal user cannot access internal document version by guessed ID/path;
- revoked/expired user cannot query or generate signed URLs;
- staff-only fields never appear in portal API payloads;
- explicit share to one portal user does not share with another contact on the same matter unless policy says so.
