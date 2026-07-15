import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { InquiryRow } from '@/types/domain';

const nextAction: Record<InquiryRow['status'], string> = {
  new: 'Open and start staff review',
  reviewing: 'Complete parties and missing information',
  conflict_check: 'Conflict review requires attention',
  accepted: 'Arrange consultation or engagement follow-up',
  declined: 'Send approved office response and close',
  closed: 'No action required',
};

export default async function InquiriesPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inquiries')
    .select(
      'id, firm_id, public_reference, internal_reference, full_name, email, phone, preferred_contact, subject, message, source, campaign, status, assigned_to, row_version, created_at',
    )
    .eq('firm_id', context.firm.id)
    .order('created_at', { ascending: false })
    .limit(100);
  const rows = (data ?? []) as InquiryRow[];

  return (
    <>
      <PageHeader
        eyebrow="New clients"
        title="Inquiry review"
        description="Open one inquiry at a time. The system will guide staff through parties, conflict review and consultation scheduling."
      />
      {error ? (
        <ErrorPanel message="The inquiry list could not be loaded. Please refresh the page or contact the office administrator." />
      ) : rows.length === 0 ? (
        <EmptyPanel title="No inquiries yet" description="New public inquiries will appear here for staff review." />
      ) : (
        <div className="grid gap-5">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold capitalize">
                      {row.status.replaceAll('_', ' ')}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">{row.internal_reference}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">{row.full_name}</h2>
                  <p className="mt-2 text-lg">{row.subject}</p>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{row.message}</p>
                  <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-semibold">Received:</span> {new Date(row.created_at).toLocaleString()}</p>
                    <p><span className="font-semibold">Contact:</span> {row.email}</p>
                    <p><span className="font-semibold">Public ref:</span> {row.public_reference}</p>
                    <p><span className="font-semibold">Source:</span> {row.source}</p>
                  </div>
                </div>
                <div className="w-full shrink-0 rounded-md border border-primary/20 bg-primary/5 p-5 lg:w-80">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next office action</p>
                  <p className="mt-2 text-lg font-semibold leading-7">{nextAction[row.status]}</p>
                  <Link
                    href={`/dashboard/inquiries/${row.id}`}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground"
                  >
                    Open inquiry
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-base text-destructive">{message}</div>;
}
