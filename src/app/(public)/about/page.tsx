import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the Office"
        title="Only verified professional information belongs on a law firm website."
        description="Batalla & Associates is establishing a public website and secure office system without inventing credentials, results, addresses, or claims that have not been formally confirmed."
      />
      <section className="container grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-secondary">Publication standard</p>
          <h2 className="mt-5 text-4xl font-semibold">Verification before promotion.</h2>
        </div>
        <div className="space-y-6 text-base leading-8 text-muted-foreground">
          <p>
            The exact attorney profile, Bar and IBP details, PTR and MCLE information, business address,
            biographies, and practice-area descriptions are intentionally withheld until the office confirms them.
          </p>
          <p>
            This prevents a polished website from becoming a source of inaccurate professional claims. Once
            verified, approved content can be published through the office content-management dashboard.
          </p>
          <p>
            The operating principle is simple: client trust must be earned through accurate information,
            confidentiality, consistent work, and accountable follow-through—not exaggerated marketing.
          </p>
        </div>
      </section>
    </>
  );
}
