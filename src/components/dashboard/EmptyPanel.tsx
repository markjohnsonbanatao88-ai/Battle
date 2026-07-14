import { Inbox } from 'lucide-react';

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
      <div>
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-4 font-sans text-base font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
