import { PageHeader } from '@/components/dashboard/PageHeader';

const controls = [
  ['Authentication', 'Supabase Auth with SSR cookie refresh and server-side identity verification'],
  ['Authorization', 'Firm membership plus PostgreSQL Row Level Security'],
  ['Sensitive administration', 'Policies prepared for role checks and AAL2 multi-factor authentication'],
  ['Documents', 'Private Supabase Storage bucket with matter-scoped paths'],
  ['Auditability', 'Append-only audit event table; direct update and delete denied'],
  ['Deployment', 'Vercel environment variables; service-role key remains server-only'],
];

export default function SecurityPage() {
  return <><PageHeader eyebrow="Security" title="Security controls" description="Confidentiality must be structural. Hiding a button in the browser is not authorization." /><div className="grid gap-4 md:grid-cols-2">{controls.map(([title, detail]) => <article key={title} className="rounded-lg border border-border bg-card p-5"><h2 className="font-sans text-base font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p></article>)}</div></>;
}
