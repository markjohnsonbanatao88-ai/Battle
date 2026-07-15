# Document and Evidence Vault

## Storage model

- Bucket: private only.
- Canonical path pattern: `firm/{firmId}/matter/{matterId}/document/{documentId}/version/{versionId}/{safeFileName}`.
- The server issues upload permissions only after verifying firm and matter contribution rights.
- Database metadata is authoritative; storage listing is not used as a permission model.

## Upload states

```text
pending_upload -> uploaded -> scanning -> available
                           -> rejected_malware
                           -> rejected_invalid
                           -> failed
```

Only `available` versions may be previewed, downloaded, shared or used by approved AI.

## Version rules

- Version numbers increment transactionally.
- Existing object bytes and metadata are immutable.
- Replacement creates a new version.
- `current_version` changes only after successful finalization.
- SHA-256 is stored and verified for evidence and high-value documents.
- Final/executed documents cannot be overwritten or silently downgraded.

## Document status

- `draft`: editable work product.
- `review`: awaiting internal review.
- `final`: approved final form.
- `executed`: signed/official executed copy.
- `archived`: retained but inactive.

Status changes require permission and audit. Executed status requires executed version and signer/provider evidence where applicable.

## Classification

- internal
- confidential
- privileged
- highly_restricted
- client_shared

`client_shared` is not a universal permission; an explicit share still exists.

## Evidence

Evidence items add:

- source and acquisition method;
- collector/custodian;
- acquired timestamp and location where needed;
- original immutable version;
- hash and verification state;
- chain-of-custody events;
- derivative/work-copy links.

The system does not claim legal admissibility; it preserves integrity and traceability for lawyer review.

## Sharing

- Internal links resolve through authenticated pages.
- Portal shares identify recipient, document version, permission, expiry and revocation.
- External one-time links are disabled by default; if later approved, they require recipient verification, expiry and download limit.
- Revocation blocks future URL creation and invalidates application-level access; already downloaded copies cannot be remotely erased and this must be communicated.

## Preview and OCR

- Preview in sandboxed viewers.
- OCR is asynchronous and stores status, engine version and extracted-text classification.
- OCR text inherits document access and is never sent to an unprotected search service.
- Failed OCR does not block original download.

## Templates and generation

- Templates have immutable versions and approved variables.
- Generation records template version and input snapshot.
- Generated output starts as draft.
- Lawyer approval is required for legal content before final/send/sign/file.
- Public content and firm letterhead use only verified fields.

## E-signature

Provider selection is deferred. Integration must use webhooks with signature verification, idempotency and event history. Final executed document is imported as a new immutable version.

## Retention

Documents inherit matter retention class unless overridden. Legal hold blocks destruction. Automated disposition produces a review queue and report before deletion.
