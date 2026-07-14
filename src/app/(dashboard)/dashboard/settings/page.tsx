import { PageHeader } from '@/components/dashboard/PageHeader';

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Firm settings" description="Do not publish or operationalize unverified professional information." />
      <div className="grid gap-4 md:grid-cols-2">
        <Setting label="Firm name" value="Batalla & Associates" status="Known" />
        <Setting label="Attorney profile and credentials" value="Awaiting formal verification" status="Blocked from publication" />
        <Setting label="Business address and contact details" value="Awaiting formal verification" status="Blocked from publication" />
        <Setting label="Practice areas and fees" value="Awaiting firm approval" status="Blocked from publication" />
      </div>
    </>
  );
}

function Setting({ label, value, status }: { label: string; value: string; status: string }) {
  return <article className="rounded-lg border border-border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-3 font-medium">{value}</p><p className="mt-2 text-xs text-primary">{status}</p></article>;
}
