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
  full_name: string;
  email: string;
  phone: string | null;
  preferred_contact: 'email' | 'phone';
  subject: string;
  message: string;
  status: 'new' | 'reviewing' | 'conflict_check' | 'accepted' | 'declined' | 'closed';
  created_at: string;
}

export interface ConsultationRow {
  id: string;
  firm_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  requested_date: string;
  requested_time_window: string;
  consultation_mode: 'office' | 'video' | 'phone';
  notes: string | null;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
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
