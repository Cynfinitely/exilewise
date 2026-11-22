/**
 * Editable guide fields. A `Fill` is a setup detail the author still has to
 * confirm (Atlas URL, screenshot, exact door, …). While `value` is null the
 * page shows a visible "To fill" marker instead of guessing, and
 * `missingFields()` lists every gap so nothing ships silently unfinished.
 */

export interface Fill<T = string> {
  readonly kind: 'fill';
  /** What the author should put here, shown in the marker. */
  readonly label: string;
  readonly value: T | null;
}

export function fill<T = string>(
  label: string,
  value: T | null = null
): Fill<T> {
  return { kind: 'fill', label, value };
}

export function isFill(v: unknown): v is Fill<unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as { kind?: unknown }).kind === 'fill' &&
    typeof (v as { label?: unknown }).label === 'string'
  );
}

/** Labels of every unfilled `Fill` anywhere inside `data` (deep walk). */
export function missingFields(data: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<unknown>();
  const walk = (v: unknown) => {
    if (typeof v !== 'object' || v === null || seen.has(v)) return;
    seen.add(v);
    if (isFill(v)) {
      if (v.value === null) out.push(v.label);
      return;
    }
    for (const child of Array.isArray(v) ? v : Object.values(v)) walk(child);
  };
  walk(data);
  return [...new Set(out)];
}
