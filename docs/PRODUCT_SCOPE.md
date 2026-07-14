# Batalla & Associates Product Scope

This document is the implementation source of truth for Claude, Codex, and human contributors. It reflects the firm research plan supplied for this project.

## Verified-content rule

Do not publish or infer professional credentials, bar details, PTR/MCLE information, office addresses, practice areas, fee claims, case results, or testimonials until the firm verifies them in writing. Unverified content stays marked as draft in the CMS.

## Compliance direction

- Avoid guarantees, comparative superiority claims, and misleading success claims.
- State clearly that submitting an inquiry does not create an attorney-client relationship.
- Require informed consent for public intake and consultation requests.
- Treat all prospective-client information as confidential and conflict-sensitive.
- Apply the Philippine Data Privacy Act through data minimization, controlled access, retention rules, and secure storage.

## Approved platform

- Next.js on Vercel
- Supabase Auth, PostgreSQL, Row Level Security, and private Storage
- GitHub for source control, pull requests, and CI
- Codex for small, testable implementation tasks
- Claude for architecture review, threat modeling, workflow critique, and copy review

Production client data, privileged material, secrets, and database dumps must never be pasted into Claude or Codex. Use synthetic or properly redacted examples.

## Phase 1 - Public site and office intake

- Home, About, Practice Areas, Contact, Privacy, and Disclaimer pages
- General inquiry form
- Consultation request form
- Secure staff login
- Inquiry management queue
- Consultation scheduling queue
- Basic CMS for verified public content
- Firm tenancy, role-based access, audit events, and admin MFA requirements

## Phase 2 - Legal operations

- Contacts and organizations
- Conflict-check workflow
- Matter tracking and matter-level permissions
- Tasks, deadlines, reminders, and calendar integration
- Private document vault with version history and signed URLs
- Client portal and secure messaging

## Phase 3 - Financials and controlled intelligence

- Timekeeping, expenses, retainers, invoices, receipts, and payment reconciliation
- Operational reports and analytics
- Matter-scoped drafting and summarization assistance
- Human approval before any generated text is sent, signed, filed, or relied upon

## Required firm assets

The following remain blockers for a fully public launch:

- Approved logo
- Verified attorney name and credentials
- Approved attorney portrait and office photography
- Verified office address and contact details
- Approved practice-area descriptions
- Approved fee-language boundaries
- Final privacy policy, terms, consent language, and conflict-check wording
