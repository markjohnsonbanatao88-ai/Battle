import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandMark className="text-primary-foreground" />
          <p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/70">
            Information on this website is general in nature. Sending an inquiry does not create an
            attorney-client relationship.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Office</p>
          <div className="mt-4 grid gap-3 text-sm text-primary-foreground/75">
            <Link href="/about">About</Link>
            <Link href="/practice-areas">Practice Areas</Link>
            <Link href="/inquiry">Send an Inquiry</Link>
            <Link href="/book">Request a Consultation</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Legal</p>
          <div className="mt-4 grid gap-3 text-sm text-primary-foreground/75">
            <Link href="/privacy">Privacy Notice</Link>
            <Link href="/disclaimer">Legal Disclaimer</Link>
            <Link href="/login">Secure Office Login</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5">
        <div className="container text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} Batalla & Associates. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
