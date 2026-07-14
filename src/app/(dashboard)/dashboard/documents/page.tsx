import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyPanel } from '@/components/dashboard/EmptyPanel';

export default function DocumentsPage() {
  return (
    <>
      <PageHeader eyebrow="Document Vault" title="Documents" description="The Supabase migration creates private matter-document storage and firm/matter access policies. Public buckets and permanent public URLs are forbidden." />
      <EmptyPanel title="No document metadata yet" description="Upload UI, antivirus scanning, OCR, versioning, and signed-download workflows belong in the next controlled implementation step." />
    </>
  );
}
