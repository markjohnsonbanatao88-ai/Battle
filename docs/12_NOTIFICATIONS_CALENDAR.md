# Notifications, Deadlines and Calendar

## Authority

The internal deadline record is authoritative. External calendars are convenience projections and may not be the sole record.

## Event types

- hearing;
- filing deadline;
- client meeting;
- consultation;
- internal review;
- administrative deadline;
- task milestone;
- custom firm-approved type.

## Deadline fields

- matter;
- source document/event;
- source date;
- due date/time and timezone;
- calculation method/note;
- responsible owner;
- reviewer/confirmer;
- severity;
- confirmation state;
- revision history.

## Default reminder model

Configurable by firm. Initial recommended defaults, subject to approval:

- critical legal deadline: 30, 14, 7, 3, 1 day and same-day reminders;
- hearing: 14, 7, 3, 1 day and 2-hour reminder;
- normal task: 3 and 1 day reminders;
- overdue escalation: assignee, reviewer, responsible lawyer, then managing partner by severity.

Defaults are not legal deadline calculations and do not replace lawyer confirmation.

## Channels

- in-app mandatory;
- email optional and approved;
- SMS optional later;
- external calendar sync optional.

Delivery failure is recorded and surfaced. Notification dispatch is idempotent.

## Calendar synchronization

- Provider tokens stored through secure secret mechanism.
- Sync maps internal event IDs to external IDs.
- External edits do not silently overwrite confirmed legal deadlines.
- Conflicts enter a review queue.
- Revoking connection does not delete internal events.

## Scheduling consultations

Requested availability is not confirmation. Staff selects a concrete slot, checks conflicts, assigns lawyer, confirms and records delivery. Cancellation/reschedule retains history.
