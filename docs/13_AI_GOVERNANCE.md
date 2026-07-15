# AI Governance

## Release position

Production AI is off by default. Claude and Codex may work on source code and synthetic data, but live client content must not be sent to development agents.

## Approved future use cases

- matter chronology draft from authorized documents;
- matter summary draft;
- document classification/tag suggestions;
- extraction of dates, parties and action items for review;
- template-assisted first drafts;
- internal search assistance with source citations;
- intake summary and duplicate/conflict search-term suggestions.

## Prohibited autonomous actions

AI may not:

- create an attorney-client relationship;
- give public legal advice as the firm;
- decide conflicts;
- calculate/confirm legal deadlines without lawyer review;
- send client communications automatically;
- sign or file documents;
- settle or commit legal positions;
- change matter access;
- mark payments reconciled;
- destroy records.

## Context and authorization

- Server resolves user, firm and matter permissions before retrieval.
- Retrieval is restricted to approved matter/object scope.
- Highly restricted matters require explicit AI enablement.
- No cross-client memory or training.
- External provider retention/training settings require vendor review.

## Prompt injection defense

- Documents are untrusted data, never system instructions.
- Tool permissions are narrow and read-only for initial release.
- Retrieved text is clearly delimited.
- Model cannot request arbitrary storage paths or SQL.
- Outputs cite source document/version IDs and page/section where possible.

## Human review

Every output is labeled draft and records reviewer disposition: accepted, edited, rejected or not used. Final legal work remains a lawyer decision.

## Audit and privacy

Record use-case, model/version, matter, source references, prompt template version, output reference, requester, reviewer and outcome. Retention of raw prompts/outputs is policy-controlled and must avoid unnecessary sensitive duplication.

## AI release gate

Before enabling live content:

- vendor/subprocessor and data-use review;
- matter-scoped RLS retrieval tests;
- prompt injection tests;
- source citation behavior;
- human approval UI;
- redaction/minimization policy;
- audit and retention implementation;
- kill switch;
- incident procedure;
- formal firm approval.
