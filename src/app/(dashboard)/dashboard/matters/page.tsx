import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { MatterRow } from '@/types/domain';

export default async function MattersPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase.from('matters').select('id, firm_id, matter_number, title, status, practice_area, responsible_lawyer_id, opened_at, created_at').eq('firm_id', context.firm.id).order('created_at', { ascending: false });
  const rows = (data ?? []) as MatterRow[];

  return (
    <>
      <PageHeader eyebrow="Legal Operations" title="Matters" description="Every matter is firm-scoped and can be further restricted through matter membership. Matter creation will follow intake and conflict-review approval." />
      {error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{error.message}</div> : rows.length === 0 ? <EmptyPanel title="No matters created" description="The legal-core schema is ready. Matter creation should be added only after the intake and conflict workflow is approved." /> : (
        <div className="grid gap-4">
          {rows.map((row) => <article key={row.id} className="rounded-lg border border-border bg-card p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-primary">{row.matter_number}</p><h2 className="mt-2 font-sans text-base font-semibold">{row.title}</h2><p className="mt-2 text-sm text-muted-foreground">{row.practice_area ?? 'Practice area not set'}</p></div><span className="text-sm capitalize text-muted-foreground">{row.status.replaceAll('_', ' ')}</span></div></article>)}
        </div>
      )}
    </>
  );
}
