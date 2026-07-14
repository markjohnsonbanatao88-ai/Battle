# Setup

## Supabase

1. Create a new Supabase project.
2. Apply `202607140001_phase1_foundation.sql`.
3. Apply `202607140002_legal_core.sql`.
4. Create the first office user in Auth.
5. Replace the email placeholder in `supabase/seed.sql` and execute it.
6. Enroll the initial administrator in MFA before granting production access.
7. Verify that the `matter-documents` bucket is private.

## Local environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_FIRM_SLUG`
- `NEXT_PUBLIC_SITE_URL`

The service-role key is not required for the current public forms or dashboard reads. Add it only for audited server-only administration that cannot be performed through user-scoped RLS.

## Vercel

Import the GitHub repository into Vercel and configure the same environment values for Development, Preview, and Production as appropriate. Mark server secrets as sensitive. Environment changes require a new deployment.

## Auth URLs

Add the production and preview callback URLs in Supabase Auth settings:

- `https://YOUR_DOMAIN/auth/callback`
- Approved Vercel preview patterns, if previews require authentication testing

Do not enable ISR or shared caching for authenticated pages.
