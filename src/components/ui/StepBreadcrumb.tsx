export function StepBreadcrumb({
  steps,
}: {
  steps: { label: string; active?: boolean; done?: boolean }[];
}) {
  return (
    <nav aria-label="Progress">
      <ol className="panel-inset flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
        {steps.map((step, i) => (
          <li key={step.label} className="inline-flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="h-px w-4 bg-forge-border" />
            ) : null}
            <span
              aria-current={step.active ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 ${
                step.active
                  ? 'font-semibold text-forge-goldbright'
                  : 'font-medium text-forge-muted'
              }`}
            >
              <span
                className={`num flex h-5 w-5 items-center justify-center rounded-full text-2xs ${
                  step.active
                    ? 'bg-forge-gold text-forge-ink'
                    : step.done
                      ? 'bg-forge-mint text-affix-suffix'
                      : 'bg-forge-panel text-forge-muted ring-1 ring-forge-border'
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
