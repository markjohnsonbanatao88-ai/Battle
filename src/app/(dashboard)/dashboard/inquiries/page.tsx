import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type { InquiryRow } from '@/types/domain';

export default async function InquiriesPage() {
  const context = await requireFirmContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, firm_id, full_name, email, phone, preferred_contact, subject, message, status, created_at')
    .eq('firm_id', context.firm.id)
    .order('created_at', { ascending: false })
    .limit(100);
  const rows = (data ?? []) as InquiryRow[];

  return (
    <>
      <PageHeader
        eyebrow="Intake"
        title="Inquiries"
        description="Public submissions land here for review. Acceptance must never be implied before conflict review and written engagement."
      />
      {error ? <ErrorPanel message={error.message} /> : rows.length === 0 ? (
        <EmptyPanel title="No inquiries yet" description="New public inquiry submissions will appear here after the Supabase migration is applied." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-5 py-3">Received</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-5 py-4"><p className="font-medium">{row.full_name}</p><p className="mt-1 text-xs text-muted-foreground">{row.email}</p></td>
                    <td className="max-w-lg px-5 py-4"><p className="font-medium">{row.subject}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{row.message}</p></td>
                    <td className="px-5 py-4 capitalize">{row.status.replaceAll('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{message}</div>;
}
