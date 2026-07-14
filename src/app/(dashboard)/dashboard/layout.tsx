import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireFirmContext } from '@/lib/auth/current-firm';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await requireFirmContext();
  return <DashboardShell context={context}>{children}</DashboardShell>;
}
