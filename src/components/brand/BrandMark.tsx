import Link from 'next/link';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-3', className)}>
      <span className="grid h-10 w-10 place-items-center border border-secondary/60 bg-primary text-primary-foreground shadow-sm">
        <Scale className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className="block font-serif text-lg font-semibold tracking-wide">Batalla & Associates</span>
        {!compact ? (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Law Office
          </span>
        ) : null}
      </span>
    </Link>
  );
}
