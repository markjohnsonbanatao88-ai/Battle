import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { TaskRow } from '@/types/domain';

export default async function TasksPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase.from('tasks').select('id, firm_id, matter_id, title, status, priority, due_at, assigned_to, created_at').eq('firm_id', context.firm.id).neq('status', 'completed').order('due_at', { ascending: true, nullsFirst: false });
  const rows = (data ?? []) as TaskRow[];
  return <><PageHeader eyebrow="Execution" title="Tasks and deadlines" description="Legal work must have owners, due dates, status, and traceable changes. Silent deadline edits are not acceptable." />{error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{error.message}</div> : rows.length === 0 ? <EmptyPanel title="No open tasks" description="Tasks will appear after matters and assignments are created." /> : <div className="grid gap-3">{rows.map((row) => <article key={row.id} className="rounded-lg border border-border bg-card p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-primary">{row.priority}</p><h2 className="mt-2 font-sans text-base font-semibold">{row.title}</h2></div><p className="text-sm text-muted-foreground">{row.due_at ? new Date(row.due_at).toLocaleString() : 'No due date'}</p></div></article>)}</div>}</>;
}
