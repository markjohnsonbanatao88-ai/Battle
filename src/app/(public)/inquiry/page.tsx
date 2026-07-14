import type { Metadata } from 'next';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = { title: 'Inquiry' };

export default function InquiryPage() {
  return (
    <>
      <PageHero
        eyebrow="Initial Inquiry"
        title="Give the office enough information to review the request—not your entire case file."
        description="Identify the parties and provide a short factual summary. Do not send original evidence, passwords, urgent deadlines, or unnecessary sensitive personal information."
      />
      <section className="container grid gap-12 py-20 lg:grid-cols-[0.65fr_1.35fr]">
        <aside className="space-y-6 text-sm leading-7 text-muted-foreground">
          <h2 className="text-3xl font-semibold text-foreground">Before submitting</h2>
          <p>The office may need the names of all relevant people and organizations for conflict screening.</p>
          <p>Submission does not mean the office has accepted your matter or agreed to protect a deadline.</p>
          <p>Use a safe email address and telephone number that the office may contact.</p>
        </aside>
        <div className="border border-border bg-card p-7 md:p-10">
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
