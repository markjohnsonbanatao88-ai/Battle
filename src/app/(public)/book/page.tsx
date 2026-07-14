import type { Metadata } from 'next';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = { title: 'Request a Consultation' };

export default function BookPage() {
  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Request a preferred date. Wait for written confirmation before treating it as booked."
        description="The office must review availability and may need to complete an initial conflict check before confirming a consultation."
      />
      <section className="container grid gap-12 py-20 lg:grid-cols-[0.65fr_1.35fr]">
        <aside className="space-y-6 text-sm leading-7 text-muted-foreground">
          <h2 className="text-3xl font-semibold text-foreground">Scheduling rules</h2>
          <p>A requested date and time window is not an appointment until confirmed by the office.</p>
          <p>Do not use this form for emergencies, court deadlines, or matters requiring immediate intervention.</p>
          <p>The available consultation modes remain subject to confirmation.</p>
        </aside>
        <div className="border border-border bg-card p-7 md:p-10">
          <ConsultationForm />
        </div>
      </section>
    </>
  );
}
