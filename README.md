# Batalla & Associates Law Office OS

A secure Next.js foundation for the Batalla & Associates public website and internal law-office operating system.

## Stack

- Next.js 16 and React 19
- Supabase Auth, PostgreSQL, Row Level Security, Realtime-ready data, and private Storage
- Vercel deployment
- GitHub source control and CI
- Claude and Codex as controlled development agents

## Current completion state

The Phase 1 foundation is complete. Client portal, advanced matter operations, billing, integrations, and controlled AI remain roadmap work defined in `docs/PRODUCT_SCOPE.md`.

## Included now

- Public website shell
- General inquiry form
- Consultation request form
- Secure office login
- Firm-scoped dashboard
- Inquiry and consultation queues
- Read-only matter, contact, task, content, and security foundations
- Supabase migrations for tenancy, RLS, audit events, legal core records, and private matter documents

## Deliberately not invented

The repository does not publish an attorney profile, IBP number, PTR/MCLE details, business address, practice areas, fee claims, results, or testimonials until the firm verifies them.

## Start locally

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
3. Apply the files in `supabase/migrations` in order.
4. Create the first user in Supabase Auth.
5. Edit and run `supabase/seed.sql` to assign the first `firm_admin` membership.
6. Install and run:

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

No build-error bypasses are permitted.
