'use client';

import { Printer } from 'lucide-react';

export function PrintButton({ label = 'Print this record' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-base font-semibold shadow-sm print:hidden"
    >
      <Printer className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  );
}
