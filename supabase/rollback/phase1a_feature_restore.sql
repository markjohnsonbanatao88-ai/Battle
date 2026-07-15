-- BatallaOS Phase 1A controlled restore after feature withdrawal.
--
-- Run only after the withdrawal cause has been resolved and the full CI/staging acceptance
-- checks have passed. This restores only the reviewed grants; it does not change data.

begin;

grant select on
  public.intakes,
  public.intake_parties,
  public.conflict_checks,
  public.conflict_search_terms,
  public.conflict_candidates,
  public.conflict_decisions
to authenticated;

grant execute on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean, text)
  to anon, authenticated;
grant execute on function public.create_intake_from_inquiry(uuid, text, text, text)
  to authenticated;
grant execute on function public.add_intake_party(uuid, text, text, text, boolean, text[], text)
  to authenticated;
grant execute on function public.run_conflict_check(uuid)
  to authenticated;
grant execute on function public.review_conflict_candidate(uuid, text, text)
  to authenticated;
grant execute on function public.record_conflict_decision(uuid, text, text, text)
  to authenticated;
grant execute on function public.schedule_cleared_consultation(uuid, uuid, uuid, timestamptz, timestamptz)
  to authenticated;
grant execute on function public.create_scheduled_consultation_from_intake(uuid, uuid, timestamptz, timestamptz, text, text)
  to authenticated;
grant execute on function public.list_active_lawyers_for_scheduling(uuid)
  to authenticated;

commit;
