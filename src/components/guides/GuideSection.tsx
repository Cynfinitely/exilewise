/** A numbered guide section with an anchor target and one h2. */
export function GuideSection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-[calc(var(--nav-height)+1rem)] space-y-5"
    >
      <header className="space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={`${id}-title`} className="display text-2xl sm:text-3xl">
          {title}
        </h2>
        {intro ? (
          <p className="max-w-3xl leading-relaxed text-forge-muted">{intro}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
