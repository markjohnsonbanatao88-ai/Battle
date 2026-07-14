import Link from 'next/link';
import {
  BookOpenCheck,
  CalendarDays,
  ContactRound,
  FileText,
  FolderKanban,
  Gauge,
  Inbox,
  ListChecks,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import type { FirmContext } from '@/types/domain';
import { BrandMark } from '@/components/brand/BrandMark';
import { LogoutButton } from './LogoutButton';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Gauge },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: Inbox },
  { href: '/dashboard/consultations', label: 'Consultations', icon: CalendarDays },
  { href: '/dashboard/matters', label: 'Matters', icon: FolderKanban },
  { href: '/dashboard/contacts', label: 'Contacts', icon: ContactRound },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/content', label: 'Website Content', icon: BookOpenCheck },
  { href: '/dashboard/security', label: 'Security', icon: ShieldCheck },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ context, children }: { context: FirmContext; children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-border bg-card lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex min-h-20 items-center justify-between border-b border-border px-5 lg:block lg:py-5">
          <BrandMark compact className="text-foreground" />
          <div className="lg:mt-5">
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:p-4" aria-label="Office workspace">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-border bg-card/80 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{context.firm.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{context.membership.role.replaceAll('_', ' ')}</p>
            </div>
            <p className="text-xs text-muted-foreground">{context.userEmail ?? 'Authenticated user'}</p>
          </div>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
