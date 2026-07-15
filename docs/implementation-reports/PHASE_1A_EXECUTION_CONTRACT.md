# Phase 1A Execution Contract

## Purpose

Deliver the first complete, usable BatallaOS legal-office workflow:

`Public inquiry → staff review → party capture → conflict warning → lawyer decision → consultation scheduling`

This contract is subordinate to the BatallaOS master architecture and must preserve its print-first, case-centered, legally controlled design.

## Required deliverables

- Public inquiry form with privacy consent and no-attorney-client-relationship disclaimer.
- Random public reference separate from internal office number.
- Database-backed rate limiting and honeypot protection.
- Staff inquiry queue and inquiry detail screen.
- Prospective-client, opposing-party, organization, alias, and related-party capture.
- Historical conflict candidate search with visible match reasons.
- Lawyer-only append-only conflict decision: clear, block, or request more information.
- Written reason and audit event for each conflict decision.
- Enforced inquiry state machine.
- Consultation scheduling blocked until conflict clearance.
- Assigned-lawyer overlap and double-booking prevention.
- Printable intake, conflict review, and consultation packets.
- Executive Command Center entries for pending decisions, waiting clients, and urgent consultations.
- Cross-firm isolation, matter-safe authorization, immutable history, safe errors, and rollback plan.
- Unit, integration, RLS/pgtap, and browser tests.

## Definition of done

The workflow is not complete because a form, table, migration, or dashboard exists. It is complete only when the entire journey works safely through the UI and database, passes CI, produces audit history and printable outputs, and cannot bypass lawyer approval.
