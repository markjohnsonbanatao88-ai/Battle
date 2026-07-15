import Link from 'next/link';
import { AlertTriangle, CalendarClock, CheckCircle2, Inbox, Scale, Users } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { PrintButton } from '@/components/dashboard/PrintButton';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';

interface UpcomingConsultation {
  id: string;
  full_name: string;
  scheduled_start: string;
  consultation_mode: 'office' | 'video' | 'phone';
}

export default async function DashboardPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const nextSevenDays = new Date(now);
  nextSevenDays.setDate(now.getDate() + 7);

  const [pendingConflicts, waitingClients, upcomingResult, newInquiries, urgentTasks] = await Promise.all([
    supabase
      .from('conflict_checks')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', context.firm.id)
      .eq('status', 'review_required'),
    supabase
      .from('intakes')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', context.firm.id)
      .in('status', ['new', 'triage', 'awaiting_information', 'ready_for_conflict_check', 'conflict_review']),
    supabase
      .from('consultation_requests')
      .select('id, full_name, scheduled_start, consultation_mode')
      .eq('firm_id', context.firm.id)
      .eq('status', 'confirmed')
      .not('scheduled_start', 'is', null)
      .gte('scheduled_start', now.toISOString())
      .lte('scheduled_start', nextSevenDays.toISOString())
      .order('scheduled_start', { ascending: true })
      .limit(6),
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', context.firm.id)
      .gte('created_at', weekStart.toISOString()),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', context.firm.id)
      .eq('priority', 'urgent')
      .in('status', ['open', 'in_progress', 'blocked'])
      .lte('due_at', nextSevenDays.toISOString()),
  ]);

  const decisionCount = pendingConflicts.count ?? 0;
  const waitingCount = waitingClients.count ?? 0;
  const inquiryCount = newInquiries.count ?? 0;
  const urgentTaskCount = urgentTasks.count ?? 0;
  const upcoming = (upcomingResult.data ?? []) as UpcomingConsultation[];
  const needsAttention = decisionCount > 0 || waitingCount > 0 || urgentTaskCount > 0;

  return (
    <>
      <PageHeader
        eyebrow="Executive Command Center"
        title="Is the office under control today?"
        description="One page for decisions, waiting clients, consultations and urgent work. Open only the item that needs action."
      />

      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton label="Print today’s office summary" />
      </div>

      <section className={`rounded-lg border-2 p-6 ${needsAttention ? 'border-amber-700 bg-amber-50/70' : 'border-emerald-700 bg-emerald-50/70'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">Office condition</p>
            <h2 className="mt-2 text-3xl font-bold">{needsAttention ? 'Attention is required' : 'No urgent Phase 1A blockers visible'}</h2>
            <p className="mt-2 max-w-3xl text-base leading-7">
              {needsAttention
                ? 'The items below show exactly what the office must handle next. Nothing legally important is completed automatically.'
                : 'The intake, conflict and consultation queues currently show no urgent unresolved item. Continue normal office review.'}
            </p>
          </div>
          {needsAttention ? <AlertTriangle className="h-12 w-12 shrink-0" /> : <CheckCircle2 className="h-12 w-12 shrink-0" />}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <CommandCard
          question="What needs a lawyer’s decision?"
          answer={`${decisionCount} conflict review${decisionCount === 1 ? '' : 's'}`}
          instruction={decisionCount > 0 ? 'Review warnings and record the written lawyer decision.' : 'No conflict decision is currently waiting.'}
          href="/dashboard/inquiries"
          linkLabel="Open inquiry review"
          icon={<Scale className="h-7 w-7" />}
          urgent={decisionCount > 0}
        />
        <CommandCard
          question="Which prospective clients are waiting?"
          answer={`${waitingCount} intake${waitingCount === 1 ? '' : 's'}`}
          instruction={waitingCount > 0 ? 'Complete parties, missing information or conflict review.' : 'No intake is waiting for staff action.'}
          href="/dashboard/inquiries"
          linkLabel="Open client intake"
          icon={<Users className="h-7 w-7" />}
          urgent={waitingCount > 0}
        />
        <CommandCard
          question="How many new inquiries arrived?"
          answer={`${inquiryCount} this week`}
          instruction="Public submissions are counted separately from accepted clients."
          href="/dashboard/inquiries"
          linkLabel="Review inquiries"
          icon={<Inbox className="h-7 w-7" />}
        />
        <CommandCard
          question="Are urgent tasks approaching?"
          answer={`${urgentTaskCount} urgent task${urgentTaskCount === 1 ? '' : 's'}`}
          instruction={urgentTaskCount > 0 ? 'Check ownership and deadline immediately.' : 'No urgent open task is due within seven days.'}
          href="/dashboard/tasks"
          linkLabel="Open tasks"
          icon={<AlertTriangle className="h-7 w-7" />}
          urgent={urgentTaskCount > 0}
        />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <CalendarClock className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-semibold">What consultations are coming?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Confirmed consultations within the next seven days, shown in Philippine time.</p>
          </div>
        </div>

        {upcomingResult.error ? (
          <p className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 p-5 text-base text-destructive">
            The consultation list could not be loaded. Other office records remain unaffected.
          </p>
        ) : upcoming.length === 0 ? (
          <p className="mt-5 rounded-md border border-border bg-background p-5 text-base">No confirmed consultation is scheduled within the next seven days.</p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {upcoming.map((consultation) => (
              <article key={consultation.id} className="rounded-md border border-border bg-background p-5">
                <p className="text-xl font-semibold">{consultation.full_name}</p>
                <p className="mt-2 text-base font-semibold">
                  {new Date(consultation.scheduled_start).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                </p>
                <p className="mt-1 capitalize text-muted-foreground">{consultation.consultation_mode}</p>
              </article>
            ))}
          </div>
        )}

        <Link href="/dashboard/consultations" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-5 text-base font-semibold print:hidden">
          Open consultation schedule
        </Link>
      </section>

      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        This command center currently covers the implemented Phase 1A queues. Hearings, Dan’s recommendations, full deadline verification and management reports will join this screen only when their authoritative modules are built and tested.
      </p>
    </>
  );
}

function CommandCard({
  question,
  answer,
  instruction,
  href,
  linkLabel,
  icon,
  urgent = false,
}: {
  question: string;
  answer: string;
  instruction: string;
  href: string;
  linkLabel: string;
  icon: React.ReactNode;
  urgent?: boolean;
}) {
  return (
    <article className={`flex min-h-72 flex-col rounded-lg border p-6 shadow-sm ${urgent ? 'border-amber-700 bg-amber-50/50' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7">{question}</h2>
        {icon}
      </div>
      <p className="mt-6 text-4xl font-bold tracking-tight">{answer}</p>
      <p className="mt-4 flex-1 text-base leading-7 text-muted-foreground">{instruction}</p>
      <Link href={href} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground print:hidden">
        {linkLabel}
      </Link>
    </article>
  );
}
