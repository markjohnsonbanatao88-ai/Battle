import Link from 'next/link';
import { ArrowRight, CalendarCheck, FileSearch, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const principles = [
  {
    icon: FileSearch,
    title: 'Structured intake',
    description:
      'Every prospective engagement begins with clear facts, identity checks, and conflict-review information.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidential operations',
    description:
      'Client information is handled through controlled access, private storage, audit records, and accountable workflows.',
  },
  {
    icon: CalendarCheck,
    title: 'Disciplined follow-through',
    description:
      'Consultations, requests, deadlines, documents, and client communications are tracked instead of left to memory.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="paper-grid overflow-hidden border-b border-border">
        <div className="container grid min-h-[680px] items-center gap-16 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
              Counsel. Preparation. Accountability.
            </p>
            <h1 className="mt-7 max-w-4xl font-serif text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl">
              Legal work built on disciplined preparation and clear execution.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
              Batalla & Associates is building a secure, accountable client experience—from initial
              inquiry and conflict review to consultation, matter coordination, and document handling.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-none px-7">
                <Link href="/inquiry">
                  Send an Inquiry <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-none border-secondary/60 px-7">
                <Link href="/book">Request a Consultation</Link>
              </Button>
            </div>
          </div>

          <aside className="border border-border bg-card p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Important notice</p>
            <h2 className="mt-5 text-3xl font-semibold">An inquiry is not yet an engagement.</h2>
            <div className="legal-rule my-7" />
            <div className="space-y-5 text-sm leading-6 text-muted-foreground">
              <p>
                Do not send urgent deadlines, original evidence, or highly sensitive information through
                the public form.
              </p>
              <p>
                No attorney-client relationship exists until the office completes its review and a written
                engagement is accepted.
              </p>
              <p>
                Professional credentials, office details, and practice-area claims will be published only
                after formal verification by the firm.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">How the office operates</p>
          <h2 className="mt-5 text-4xl font-semibold md:text-5xl">A serious legal office needs more than a contact form.</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            The system is designed around traceable work, controlled access, written decisions, and clean handoffs.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <article key={title} className="border border-border bg-card p-7">
              <Icon className="h-6 w-6 text-secondary" aria-hidden="true" />
              <h3 className="mt-7 text-2xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
