import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Practice Areas' };

export default function PracticeAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Practice Areas"
        title="The firm’s service areas will be published after formal verification."
        description="No legal specialty, credential, result, or comparative claim is being invented for launch. The office will approve each practice-area description before it becomes public."
      />
      <section className="container py-20">
        <div className="max-w-3xl border border-border bg-card p-8 md:p-12">
          <h2 className="text-3xl font-semibold">Need to ask whether the office can review your concern?</h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Send a short factual summary. The office can first determine whether the matter is within its
            present scope and whether a conflict review is required. Do not send confidential evidence or
            rely on the form for urgent deadlines.
          </p>
          <Button asChild className="mt-8 rounded-none">
            <Link href="/inquiry">
              Start an inquiry <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
