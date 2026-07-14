import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Use the secure intake path instead of sending unstructured case details."
        description="Verified office address, telephone numbers, and other public contact details will be added after confirmation by the firm."
      />
      <section className="container grid gap-6 py-20 md:grid-cols-2">
        <article className="border border-border bg-card p-8">
          <h2 className="text-3xl font-semibold">General inquiry</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Provide names, a short summary, and a safe way for the office to contact you.
          </p>
          <Button asChild className="mt-8 rounded-none">
            <Link href="/inquiry">Open inquiry form</Link>
          </Button>
        </article>
        <article className="border border-border bg-card p-8">
          <h2 className="text-3xl font-semibold">Consultation request</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Request a preferred date, time window, and consultation mode. Submission does not confirm an appointment.
          </p>
          <Button asChild variant="outline" className="mt-8 rounded-none border-secondary/60">
            <Link href="/book">Request consultation</Link>
          </Button>
        </article>
      </section>
    </>
  );
}
