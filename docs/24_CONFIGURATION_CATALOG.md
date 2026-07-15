# Configuration Catalog

Configuration is firm-scoped, versioned where it affects historical behavior, permission-controlled and audited.

## Firm identity

- legal/public name;
- approved short name;
- office locations;
- timezone (`Asia/Manila` default);
- locale/date format;
- currency (`PHP` default);
- approved contact channels;
- logo/letterhead assets.

## Public content

- page content and approval;
- practice areas;
- privacy/disclaimer/consent versions;
- consultation modes and availability language;
- public form retention category;
- emergency/urgent wording.

## Matter operations

- matter numbering pattern;
- matter types and practice areas;
- party-role vocabulary;
- confidentiality labels;
- required opening/closing checklist templates;
- custom fields;
- default folder structure.

## Tasks/calendar

- event/task types;
- reminder offsets and escalation chains;
- workweek/office hours;
- calendar provider and sync rules;
- overdue severity thresholds.

## Documents

- allowed MIME types and maximum sizes;
- classification/status vocabulary;
- malware scanner and quarantine policy;
- retention classes;
- template categories;
- signed URL duration bounded by security maximum.

## Portal

- invitation expiry;
- MFA/identity policy;
- portal terms version;
- default share expiry;
- acknowledgment requirements;
- message and upload limits.

## Billing

- invoice/receipt numbering;
- default payment terms;
- tax/discount configuration after accounting/legal approval;
- rate cards and effective dates;
- invoice approval thresholds;
- payment methods;
- write-off/void approval thresholds.

## Security/privacy

- MFA enforcement;
- external-access maximum duration;
- export approval thresholds;
- session policy;
- retention and legal hold authorities;
- incident contacts;
- backup/recovery objectives;
- approved integrations/vendors;
- AI enablement and approved use cases.

## Configuration behavior

- Historical records retain snapshots of configuration that affected them.
- High-risk configuration changes require AAL2 and audit.
- Missing required production configuration blocks launch rather than silently using unsafe defaults.
