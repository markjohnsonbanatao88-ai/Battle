import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-primary px-6 text-primary-foreground">
      <section className="w-full max-w-xl border border-primary-foreground/20 bg-primary-foreground/5 p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-secondary" />
        <h1 className="mt-6 text-4xl font-semibold">Firm access is not assigned.</h1>
        <p className="mt-5 leading-7 text-primary-foreground/70">
          Your authentication account exists, but it is not connected to an active Batalla & Associates firm membership.
          An administrator must assign the correct role before confidential office data can be opened.
        </p>
        <Button asChild variant="outline" className="mt-8 rounded-none border-primary-foreground/30 bg-transparent text-primary-foreground">
          <Link href="/login">Return to login</Link>
        </Button>
      </section>
    </main>
  );
}
