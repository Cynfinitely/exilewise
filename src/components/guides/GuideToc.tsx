export interface TocItem {
  id: string;
  label: string;
}

/**
 * In-page contents: a sticky sidebar on large screens, a horizontally
 * scrolling strip on small ones. Plain anchor links, so it works without
 * JavaScript and with the keyboard.
 */
export function GuideToc({ items }: { items: TocItem[] }) {
  return (
    <nav
      aria-label="On this page"
      className="lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]"
    >
      <p className="section-title mb-2 hidden lg:block">On this page</p>
      <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
        {items.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="tap flex items-center gap-2 rounded-lg border border-forge-border bg-forge-panel2/70 px-3 py-1.5 text-sm text-forge-muted transition-colors hover:border-forge-gold/50 hover:text-forge-goldbright lg:border-transparent lg:bg-transparent lg:px-2 lg:py-1"
            >
              <span className="num font-display text-xs text-forge-gold/80">
                {i + 1}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
