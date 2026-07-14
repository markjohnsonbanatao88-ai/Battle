import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Office Login', robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="paper-grid grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md border border-border bg-card p-8 shadow-2xl md:p-10">
        <BrandMark />
        <div className="legal-rule my-8" />
        <h1 className="text-3xl font-semibold">Secure office access</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in to the private Batalla & Associates operations workspace.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading secure login…</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <Link href="/" className="mt-8 block text-center text-sm text-muted-foreground hover:text-foreground">
          Return to public website
        </Link>
      </div>
    </main>
  );
}
