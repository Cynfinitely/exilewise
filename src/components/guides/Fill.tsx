import type { Fill as FillField } from '@/lib/poe1/guides/fill';

/**
 * Visible marker for a guide detail the author has not filled in yet.
 * Shows the value once set. Never use it in headline text.
 */
export function Fill<T>({
  field,
  render = v => String(v),
}: {
  field: FillField<T>;
  render?: (value: T) => React.ReactNode;
}) {
  if (field.value !== null) return <>{render(field.value)}</>;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-warn-border bg-warn-bg px-1.5 py-0.5 text-xs font-medium text-warn-fg">
      <span aria-hidden>✎</span>
      <span>
        <span className="sr-only">Not filled in yet: </span>
        To fill: {field.label}
      </span>
    </span>
  );
}

/**
 * Small note on where a claim comes from. Default: long-standing behaviour
 * not re-checked for this patch. `fromRun`: seen in the author's screenshots.
 */
export function CheckNote({
  children,
  fromRun = false,
}: {
  children: React.ReactNode;
  fromRun?: boolean;
}) {
  return (
    <p className="flex gap-2 text-xs leading-relaxed text-info-fg">
      <span aria-hidden className="font-bold">
        {fromRun ? '◉' : '?'}
      </span>
      <span>
        <span className="font-semibold">
          {fromRun ? 'From my run: ' : 'Check in game: '}
        </span>
        {children}
      </span>
    </p>
  );
}
