export type MembershipRole =
  | 'firm_admin'
  | 'managing_partner'
  | 'partner'
  | 'associate'
  | 'paralegal'
  | 'legal_secretary'
  | 'billing'
  | 'external_collaborator';

export interface Firm {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
}

export interface FirmMembership {
  id: string;
  firm_id: string;
  user_id: string;
  role: MembershipRole;
  status: 'active' | 'invited' | 'disabled';
  created_at: string;
}

export interface FirmContext {
  userId: string;
  userEmail: string | null;
  firm: Firm;
  membership: FirmMembership;
}

export interface InquiryRow {
  id: string;
  firm_id: string;
  public_reference: string;
  internal_reference: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_contact: 'email' | 'phone';
  subject: string;
  message: string;
  source: string;
  campaign: string | null;
  status: 'new' | 'reviewing' | 'conflict_check' | 'accepted' | 'declined' | 'closed';
  assigned_to: string | null;
  row_version: number;
  created_at: string;
}

export type IntakeStatus =
  | 'new'
  | 'triage'
  | 'awaiting_information'
  | 'ready_for_conflict_check'
  | 'conflict_review'
  | 'cleared'
  | 'conditional'
  | 'conflicted'
  | 'deferred'
  | 'consultation_pending'
  | 'consultation_scheduled'
  | 'declined'
  | 'closed';

export interface IntakeRow {
  id: string;
  firm_id: string;
  inquiry_id: string;
  status: IntakeStatus;
  urgency: 'normal' | 'urgent' | 'critical';
  summary: string;
  jurisdiction: string | null;
  missing_information: string | null;
  owner_user_id: string | null;
  row_version: number;
  created_at: string;
  updated_at: string;
}

export interface IntakePartyRow {
  id: string;
  firm_id: string;
  intake_id: string;
  party_type: 'person' | 'organization';
  display_name: string;
  party_role: string;
  is_adverse: boolean;
  aliases: string[];
  relationship_note: string | null;
  created_at: string;
}

export interface ConflictCandidateRow {
  id: string;
  conflict_check_id: string;
  matched_source: 'contact' | 'contact_alias' | 'prior_intake' | 'matter_party';
  matched_display_name: string;
  match_reason: string;
  match_score: number;
  review_status: 'unreviewed' | 'not_relevant' | 'potential' | 'confirmed' | 'needs_more_information';
  reviewer_reason: string | null;
  reviewed_at: string | null;
}

export interface ConflictDecisionRow {
  id: string;
  intake_id: string;
  conflict_check_id: string;
  decision_version: number;
  disposition: 'cleared' | 'conditional' | 'conflicted' | 'deferred';
  reasoning: string;
  conditions: string | null;
  decided_by: string;
  decided_at: string;
}

export interface ConsultationRow {
  id: string;
  firm_id: string;
  inquiry_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  requested_date: string;
  requested_time_window: string;
  consultation_mode: 'office' | 'video' | 'phone';
  notes: string | null;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  scheduled_start: string | null;
  scheduled_end: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface SiteContentRow {
  id: string;
  firm_id: string;
  content_key: string;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  updated_at: string;
}

export interface MatterRow {
  id: string;
  firm_id: string;
  matter_number: string;
  title: string;
  status: 'prospective' | 'open' | 'on_hold' | 'closed' | 'archived';
  practice_area: string | null;
  responsible_lawyer_id: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface ContactRow {
  id: string;
  firm_id: string;
  contact_type: 'person' | 'organization';
  display_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface TaskRow {
  id: string;
  firm_id: string;
  matter_id: string | null;
  title: string;
  status: 'open' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_at: string | null;
  assigned_to: string | null;
  created_at: string;
}
