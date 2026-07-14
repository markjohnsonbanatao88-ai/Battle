import { CalendarClock, ContactRound, FolderKanban, Inbox, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';

async function getCount(table: string, firmId: string, status?: string) {
  const supabase = await createClient();
  let query = supabase.from(table).select('*', { count: 'exact', head: true }).eq('firm_id', firmId);
  if (status) query = query.eq('status', status);
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export default async function DashboardPage() {
  const context = await requireFirmContext();
  const [newInquiries, consultationRequests, openMatters, openTasks, contacts] = await Promise.all([
    getCount('inquiries', context.firm.id, 'new'),
    getCount('consultation_requests', context.firm.id, 'requested'),
    getCount('matters', context.firm.id, 'open'),
    getCount('tasks', context.firm.id, 'open'),
    getCount('contacts', context.firm.id),
  ]);

  const cards = [
    { label: 'New inquiries', value: newInquiries, icon: Inbox },
    { label: 'Consultation requests', value: consultationRequests, icon: CalendarClock },
    { label: 'Open matters', value: openMatters, icon: FolderKanban },
    { label: 'Open tasks', value: openTasks, icon: ListChecks },
    { label: 'Contacts', value: contacts, icon: ContactRound },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Command Center"
        title="Office overview"
        description="This dashboard reads firm-scoped data through Supabase Row Level Security. Counts remain zero until the migrations are applied and the authenticated user has an active firm membership."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-5 text-3xl font-semibold">{value}</p>
          </article>
        ))}
      </div>
      <section className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="font-sans text-base font-semibold">Operational foundation</h2>
        <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
          <Status label="Data isolation" value="Supabase Row Level Security" />
          <Status label="Document storage" value="Private, matter-scoped bucket" />
          <Status label="Delivery pipeline" value="GitHub CI + Vercel" />
        </div>
      </section>
    </>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}
