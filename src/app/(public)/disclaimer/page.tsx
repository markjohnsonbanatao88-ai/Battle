import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = { title: 'Legal Disclaimer' };

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Disclaimer"
        title="Website information is not legal advice and does not create a professional relationship."
        description="The office must complete review, conflict checking, and written engagement before any attorney-client relationship is formed."
      />
      <article className="prose prose-zinc mx-auto max-w-3xl px-6 py-20">
        <h2>No legal advice</h2>
        <p>
          General website information cannot account for your complete facts, deadlines, documents, venue, or
          applicable law. Do not act or delay action solely because of information on this website.
        </p>
        <h2>No attorney-client relationship</h2>
        <p>
          Sending an inquiry, requesting a consultation, or receiving an automated acknowledgment does not create
          an attorney-client relationship. A relationship begins only after conflict review and written acceptance.
        </p>
        <h2>No guarantee</h2>
        <p>
          No statement on this website guarantees a result. Past outcomes, if later published and lawfully used,
          do not predict future outcomes.
        </p>
        <h2>Urgent matters</h2>
        <p>
          Public forms are not an emergency service and must not be relied upon to preserve a filing period,
          hearing date, prescription period, or other legal deadline.
        </p>
      </article>
    </>
  );
}
