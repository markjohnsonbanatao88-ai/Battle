# Billing and Financials Blueprint

## Scope

The system supports law-office operational billing. It does not assume custody of trust funds, accounting-system replacement or any payment provider until separately approved.

## Billing arrangements

- hourly;
- fixed fee;
- retainer against fees/expenses;
- milestone;
- non-billable/pro bono;
- custom arrangement requiring approved configuration.

Arrangement versions have effective dates and approval. Rate changes never rewrite historical approved entries.

## Timekeeping

Fields: matter, user, work date, duration minutes, narrative, activity code, billable state, rate source/snapshot, approval state and invoice linkage.

Rules:

- no negative duration;
- duplicate/overlapping time warning;
- edits after approval create revision history;
- invoiced time cannot be edited directly;
- narratives may be client-facing or internal, stored separately when needed.

## Expenses

Fields: matter, date, payee, category, description, amount, tax, currency, receipt document, reimbursable/billable state, approval and invoice linkage.

## Retainers

Use an append-only ledger. Balance is derived and validated transactionally. Adjustments require reason and approval. Do not use a mutable single balance as the only source of truth.

## Invoice lifecycle

```text
draft -> review -> approved -> issued -> partially_paid -> paid
                       \-> void
issued -> overdue
issued/paid -> credit_note/replacement as correction
```

- Drafts can change.
- Issuance assigns immutable invoice number and snapshot.
- Issued invoice is never silently edited.
- Due date, taxes, discounts and fee language are configuration-controlled.

## Payments

Initial implementation supports authorized manual reconciliation with method, reference, date, amount, evidence and reconciler. Provider integration later requires signed webhooks, idempotency and reconciliation against provider records.

Clicking a UI button is never sufficient proof of payment.

## Receipts

Generated only after verified/reconciled payment allocation. Receipt number is unique and immutable; void/correction is audited.

## Access

- Billing role may view necessary client/matter metadata and financial documents.
- Billing role does not automatically see legal strategy or privileged document contents.
- Matter-level restriction remains in force.
- Partners/managing partner approve arrangements and high-risk corrections according to thresholds.

## Reports

- work in progress/unbilled time;
- billed versus collected;
- accounts receivable aging;
- retainer balances;
- expenses pending reimbursement;
- matter revenue and realization where approved;
- user utilization without misleading performance claims.

Reports use permission-filtered views and documented definitions.
