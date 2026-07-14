import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { SiteContentRow } from '@/types/domain';

export default async function ContentPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_content').select('id, firm_id, content_key, title, body, status, updated_at').eq('firm_id', context.firm.id).order('content_key');
  const rows = (data ?? []) as SiteContentRow[];
  return <><PageHeader eyebrow="Public Website" title="Content approval" description="Credentials, practice areas, office details, testimonials, and marketing claims must remain draft until verified and approved." />{error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{error.message}</div> : rows.length === 0 ? <EmptyPanel title="No managed content" description="Seed content will appear after the first Supabase migration is applied." /> : <div className="grid gap-4">{rows.map((row) => <article key={row.id} className="rounded-lg border border-border bg-card p-5"><div className="flex justify-between gap-4"><div><p className="text-xs text-primary">{row.content_key}</p><h2 className="mt-2 font-sans text-base font-semibold">{row.title}</h2></div><span className="text-xs uppercase tracking-wide text-muted-foreground">{row.status}</span></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{row.body}</p></article>)}</div>}</>;
}
