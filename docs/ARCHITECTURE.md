# Architecture

## Product boundary

This repository is a private law-office operating system plus a controlled public website. It is not a public lawyer marketplace and it does not provide automated legal advice.

## Trust boundaries

1. The browser is untrusted.
2. Supabase Auth verifies identity.
3. Firm membership establishes tenant access.
4. PostgreSQL Row Level Security enforces database isolation.
5. Matter access narrows confidential legal records beyond firm membership.
6. Supabase Storage remains private and uses matter-scoped paths.
7. Vercel stores deployment secrets outside the repository.
8. GitHub Actions must fail on lint, type, or build errors.

## Request flow

- Public inquiries and consultation requests call narrowly scoped PostgreSQL functions.
- Protected pages verify the current Supabase user on the server.
- The application resolves an active firm membership before rendering office data.
- Database policies independently verify firm and matter access.
- Sensitive administrative writes can require an AAL2 multi-factor session.

## Data model

Phase 1 includes firms, profiles, memberships, inquiries, consultation requests, website content, and audit events.

The legal core includes contacts, aliases, matters, matter memberships, matter parties, tasks, document metadata, document versions, and private storage policies.

## Offline policy

Complete client or matter files must not be copied into browser IndexedDB by default. Future offline support must be explicit, encrypted, revocable, and limited to approved data.
