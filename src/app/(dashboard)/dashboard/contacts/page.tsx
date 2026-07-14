import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { ContactRow } from '@/types/domain';

export default async function ContactsPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase.from('contacts').select('id, firm_id, contact_type, display_name, email, phone, created_at').eq('firm_id', context.firm.id).order('display_name');
  const rows = (data ?? []) as ContactRow[];
  return <><PageHeader eyebrow="CRM" title="Contacts" description="Clients, prospective clients, adverse parties, witnesses, counsel, courts, agencies, and organizations belong in one conflict-searchable contact system." />{error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{error.message}</div> : rows.length === 0 ? <EmptyPanel title="No contacts yet" description="Contacts will be created through intake and authorized office workflows." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <article key={row.id} className="rounded-lg border border-border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{row.contact_type}</p><h2 className="mt-2 font-sans text-base font-semibold">{row.display_name}</h2><p className="mt-3 text-sm text-muted-foreground">{row.email ?? 'No email'}</p></article>)}</div>}</>;
}
