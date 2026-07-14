import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = { title: 'Privacy Notice' };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Draft privacy notice for formal legal review."
        description="This page establishes the operating baseline for consent, secure storage, access control, retention, and data-subject requests. It must be approved by the firm before production launch."
      />
      <article className="prose prose-zinc mx-auto max-w-3xl px-6 py-20">
        <h2>Information collected</h2>
        <p>
          The office may collect identity, contact, scheduling, conflict-check, and matter-summary information
          submitted through this website. Public forms should not be used to transmit original evidence or
          unnecessary sensitive personal information.
        </p>
        <h2>Purpose</h2>
        <p>
          Information is used to review inquiries, perform conflict screening, arrange consultations, maintain
          office records, secure the system, and comply with lawful professional obligations.
        </p>
        <h2>Access and storage</h2>
        <p>
          Access is restricted by role and firm membership. Documents are intended to remain in private storage
          and be delivered through time-limited authorized links rather than public URLs.
        </p>
        <h2>Retention and requests</h2>
        <p>
          Final retention periods, deletion rules, legal holds, contact details for privacy requests, and any
          required Data Protection Officer information must be confirmed before launch.
        </p>
      </article>
    </>
  );
}
