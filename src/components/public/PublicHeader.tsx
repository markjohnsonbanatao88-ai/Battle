import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/about', label: 'About' },
  { href: '/practice-areas', label: 'Practice Areas' },
  { href: '/inquiry', label: 'Inquiry' },
  { href: '/book', label: 'Book' },
  { href: '/contact', label: 'Contact' },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex min-h-20 items-center justify-between gap-6">
        <BrandMark />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="outline" className="border-secondary/60 bg-transparent">
          <Link href="/login">Office Login</Link>
        </Button>
      </div>
      <div className="border-t border-border/50 lg:hidden">
        <nav className="container flex gap-5 overflow-x-auto py-3 text-sm" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 text-muted-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
