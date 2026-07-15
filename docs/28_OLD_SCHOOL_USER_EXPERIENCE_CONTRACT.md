# Old-School User Experience Contract

## Non-negotiable user reality

Batalla & Associates is an old-school law office. The primary users are not technology-savvy and must not be required to change their natural working habits to fit the software.

The system must adapt to them.

This is a binding product requirement, not a visual preference.

## Known users and working style

### Atty. Virgilio R. Batalla

- Prefers hard copy over soft copy.
- Will read thick paper files and lengthy printed records.
- Values preparation, discipline, completeness, accountability, and persistence.
- Must be able to review, annotate, approve, and print without navigating complex software.
- His primary screen is the Executive Command Center: large text, simple decisions, clear ownership, and printable summaries.

### Dan Tejada

- Senior, trusted, old-school adviser/associate.
- Not technology-oriented.
- Likely carries significant institutional memory and practical office knowledge.
- His interface must prioritize Cases, Reviews, Tasks, Knowledge, Hearings, and Print.

### Secretary and support staff

- Older and not technology-savvy.
- Encoding and complex interfaces create operational risk.
- The secretary workflow must use clear single-purpose actions: New Client, Scan, Schedule, Print, Calls, and Find Folder.
- The system must prevent mistakes through constrained choices, confirmation, previews, duplicate checks, and reversible drafts.

## Design principle

**The office does not adapt to BatallaOS. BatallaOS adapts to the office.**

Technology must remain mostly invisible. The system should feel like a safer, faster extension of the office's existing paper workflow.

## Required interaction rules

1. Use plain language, not software jargon.
2. Prefer one primary action per screen.
3. Use large readable text, high contrast, generous spacing, and obvious buttons.
4. Avoid hidden gestures, hover-only actions, dense dashboards, nested menus, and icon-only controls.
5. Never require users to remember technical terms, record IDs, file paths, or status codes.
6. Always show the client name, matter number, responsible person, current status, and next required action.
7. Important actions require a review screen before final confirmation.
8. Destructive or legally significant actions require explicit reason, lawyer approval where applicable, and audit history.
9. Save drafts automatically where safe, but never automatically file, send, approve, delete, or create a legal commitment.
10. Every important screen and workflow must have a printable version.
11. Printed output must be complete enough for Atty. Batalla to read without opening the software.
12. Paper and digital records must remain reconcilable through matter numbers, folder labels, QR codes, movement logs, and print timestamps.
13. Error messages must explain what happened and what the user should do next in ordinary language.
14. Repeated information should be prefilled, but users must be able to review it before use.
15. The system should minimize typing through scanning, templates, structured choices, and controlled defaults.
16. No workflow may depend on users checking multiple screens to know whether work is complete.
17. The system must clearly identify who owns the next action.
18. Training should be possible through printed one-page guides and on-screen examples.

## Print-first standard

Atty. Batalla may choose to read a complete file on paper regardless of thickness. Therefore the system must support:

- complete matter print packets;
- intake and conflict-review packets;
- consultation packets;
- hearing packets;
- full chronology;
- document and evidence indexes;
- task and deadline lists;
- internal review packets;
- billing statements and receipts;
- physical folder covers and movement slips;
- monthly management reports.

Packet generation must preserve page numbers, matter identity, version dates, confidentiality labels, preparer, reviewer, and print timestamp.

## Acceptance test

A feature fails this contract when:

- an experienced lawyer or secretary cannot use it without understanding software concepts;
- a user must adapt their office routine to the application rather than the application supporting the routine;
- important information cannot be printed clearly;
- the interface hides ownership or next steps;
- the workflow increases the chance of a legal or clerical mistake;
- a thick file cannot be produced as a complete, organized, readable packet;
- the system replaces judgment instead of supporting it.

Every epic must state how it complies with this contract before it can be marked complete.
