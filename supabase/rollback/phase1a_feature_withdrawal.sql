-- BatallaOS Phase 1A emergency feature withdrawal.
--
-- Purpose: stop new public submissions and protected Phase 1A mutations while preserving
-- every inquiry, intake, conflict decision, audit event and consultation record.
-- Run only under an approved incident/change record. This script is intentionally non-destructive.

begin;

revoke execute on function public.submit_public_inquiry(text, text, text, text, text, text, text, boolean, text)
  from anon, authenticated;
revoke execute on function public.create_intake_from_inquiry(uuid, text, text, text)
  from authenticated;
revoke execute on function public.add_intake_party(uuid, text, text, text, boolean, text[], text)
  from authenticated;
revoke execute on function public.run_conflict_check(uuid)
  from authenticated;
revoke execute on function public.review_conflict_candidate(uuid, text, text)
  from authenticated;
revoke execute on function public.record_conflict_decision(uuid, text, text, text)
  from authenticated;
revoke execute on function public.schedule_cleared_consultation(uuid, uuid, uuid, timestamptz, timestamptz)
  from authenticated;
revoke execute on function public.create_scheduled_consultation_from_intake(uuid, uuid, timestamptz, timestamptz, text, text)
  from authenticated;
revoke execute on function public.list_active_lawyers_for_scheduling(uuid)
  from authenticated;

-- Remove Data API reads for the new workflow while it is withdrawn. Base inquiry and
-- consultation records remain available under their pre-existing policies for incident review.
revoke select on
  public.intakes,
  public.intake_parties,
  public.conflict_checks,
  public.conflict_search_terms,
  public.conflict_candidates,
  public.conflict_decisions
from authenticated;

commit;
