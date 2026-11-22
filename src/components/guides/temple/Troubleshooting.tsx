import { TROUBLESHOOTING } from '@/lib/poe1/guides/temple/decisions';

/** Edge cases, collapsed by default. Native <details> stays keyboard-friendly. */
export function Troubleshooting() {
  return (
    <div className="space-y-3">
      {TROUBLESHOOTING.map(t => (
        <details key={t.problem} className="panel-inset group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-forge-goldbright">
            {t.problem}
            <span
              aria-hidden
              className="text-forge-gold transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forge-muted marker:text-forge-gold">
            {t.answer.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
