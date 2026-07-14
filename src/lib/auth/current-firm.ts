import { redirect } from 'next/navigation';
import type { Firm, FirmContext, FirmMembership } from '@/types/domain';
import { createClient } from '@/lib/supabase/server';

export async function requireFirmContext(): Promise<FirmContext> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/login');
  }

  const { data: membershipData, error: membershipError } = await supabase
    .from('firm_memberships')
    .select('id, firm_id, user_id, role, status, created_at')
    .eq('user_id', authData.user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`Unable to resolve firm membership: ${membershipError.message}`);
  }

  if (!membershipData) {
    redirect('/access-pending');
  }

  const membership = membershipData as FirmMembership;
  const { data: firmData, error: firmError } = await supabase
    .from('firms')
    .select('id, name, slug, status')
    .eq('id', membership.firm_id)
    .single();

  if (firmError || !firmData) {
    throw new Error(`Unable to resolve firm: ${firmError?.message ?? 'Firm not found'}`);
  }

  return {
    userId: authData.user.id,
    userEmail: authData.user.email ?? null,
    firm: firmData as Firm,
    membership,
  };
}
