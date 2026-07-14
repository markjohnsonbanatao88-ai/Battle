export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="container py-16 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/70 md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
