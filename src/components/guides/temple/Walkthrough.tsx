import { CheckNote } from '@/components/guides/Fill';
import { FLOW_CHECKS, LOOP } from '@/lib/poe1/guides/temple/content';

const PARTS = [
  { key: 'prepare', label: 'Prepare' },
  { key: 'alva', label: 'With Alva' },
  { key: 'beforeLeaving', label: 'Check before leaving' },
  { key: 'ifMissing', label: 'If the room doesn’t appear' },
] as const;

/** Map 1, 2 and 3 as numbered steps, each split into the same four parts. */
export function Walkthrough() {
  return (
    <div className="space-y-5">
      <ol className="space-y-5">
        {LOOP.map(step => (
          <li key={step.map} className="panel p-4 sm:p-6">
            <h3 className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-forge-gold">
                {step.map}
              </span>
              <span className="display text-xl">
                Map {step.map}: {step.glance}
              </span>
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {PARTS.map(part => (
                <div key={part.key} className="panel-inset p-4">
                  <h4 className="section-title text-forge-rust-strong">
                    {part.label}
                  </h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forge-goldbright marker:text-forge-gold">
                    {step[part.key].map(line => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <CheckNote fromRun>{FLOW_CHECKS.templeOpens}</CheckNote>
    </div>
  );
}
