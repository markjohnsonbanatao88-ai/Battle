import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { ConsultationRow } from '@/types/domain';

export default async function ConsultationsPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('consultation_requests')
    .select('id, firm_id, full_name, email, phone, requested_date, requested_time_window, consultation_mode, notes, status, created_at')
    .eq('firm_id', context.firm.id)
    .order('requested_date', { ascending: true })
    .limit(100);
  const rows = (data ?? []) as ConsultationRow[];

  return (
    <>
      <PageHeader eyebrow="Scheduling" title="Consultation requests" description="Requested slots are not confirmed appointments. Staff must review availability and conflict-screening requirements before confirmation." />
      {error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{error.message}</div> : rows.length === 0 ? (
        <EmptyPanel title="No consultation requests" description="Requests from the public booking form will appear here." />
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="font-sans text-base font-semibold">{row.full_name}</h2><p className="mt-1 text-sm text-muted-foreground">{row.email}</p></div>
                <span className="rounded-full border border-border px-3 py-1 text-xs capitalize">{row.status}</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <p><span className="text-foreground">Date:</span> {row.requested_date}</p>
                <p><span className="text-foreground">Window:</span> {row.requested_time_window}</p>
                <p><span className="text-foreground">Mode:</span> {row.consultation_mode}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
