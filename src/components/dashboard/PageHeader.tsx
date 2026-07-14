export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
