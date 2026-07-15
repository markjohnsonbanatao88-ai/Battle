-- EPIC-001: explicit Data API privileges.
-- RLS remains the authorization boundary; these grants only expose operations that have policies.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on public.site_content to anon;

grant select on
  public.firms,
  public.profiles,
  public.firm_memberships,
  public.inquiries,
  public.consultation_requests,
  public.site_content,
  public.audit_events,
  public.contacts,
  public.contact_aliases,
  public.matters,
  public.matter_memberships,
  public.matter_parties,
  public.tasks,
  public.documents,
  public.document_versions
  to authenticated;

grant update on public.profiles to authenticated;

grant insert, update on public.firm_memberships to authenticated;
grant update on public.inquiries to authenticated;
grant update on public.consultation_requests to authenticated;
grant insert, update on public.site_content to authenticated;

grant insert, update, delete on public.contacts to authenticated;
grant insert, update, delete on public.contact_aliases to authenticated;
grant insert, update on public.matters to authenticated;
grant insert, update, delete on public.matter_memberships to authenticated;
grant insert, update, delete on public.matter_parties to authenticated;
grant insert, update, delete on public.tasks to authenticated;
grant insert, update, delete on public.documents to authenticated;
grant insert on public.document_versions to authenticated;

-- Direct writes to audit_events remain prohibited. Audit rows are written by controlled triggers/functions.
