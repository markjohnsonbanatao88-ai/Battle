-- Supabase installs pgcrypto helpers outside the restricted `public` search path.
-- Use PostgreSQL's UUID generator so inquiry inserts work with a hardened trigger search path.

create or replace function public.assign_inquiry_references()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.public_reference is null then
    new.public_reference := 'INQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  end if;
  if new.internal_reference is null then
    new.internal_reference := 'BAT-I-' || extract(year from coalesce(new.created_at, now()))::text || '-' ||
      lpad(nextval('public.inquiry_internal_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
