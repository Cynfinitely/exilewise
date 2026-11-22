import { Fill } from '@/components/guides/Fill';
import { Badge } from '@/components/ui/Badge';
import {
  CHECKLIST,
  LOOP,
  NOTABLES,
  QUICK_START,
  ROYAL_VISAGE_MAP,
} from '@/lib/poe1/guides/temple/content';

/** Quick start: what it makes, who it suits, what to bring. */
export function QuickStart() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="panel space-y-2 p-5">
        <h3 className="display text-lg">What it produces</h3>
        <p className="text-sm leading-relaxed text-forge-muted">
          {QUICK_START.produces}
        </p>
      </div>
      <div className="panel space-y-2 p-5">
        <h3 className="display text-lg">Who it suits</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forge-muted marker:text-forge-gold">
          {QUICK_START.suits.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="panel space-y-2 p-5">
        <h3 className="display text-lg">What to prepare</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forge-muted marker:text-forge-gold">
          {QUICK_START.prepare.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The three maps at a glance, always visible. */
export function LoopGlance() {
  return (
    <div className="space-y-3">
      <h3 className="display text-lg">The loop at a glance</h3>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOOP.map(step => (
          <li key={step.map} className="panel-inset p-4">
            <p className="eyebrow">Map {step.map}</p>
            <p className="mt-1 text-sm font-medium leading-snug text-forge-goldbright">
              {step.glance}
            </p>
            <p className="mt-2 text-xs text-forge-muted">8 Threads</p>
          </li>
        ))}
        <li className="rounded-xl border border-forge-gold/50 bg-forge-peach/60 p-4">
          <p className="eyebrow">Temple</p>
          <p className="mt-1 text-sm font-medium leading-snug text-forge-goldbright">
            Itemise with Alva, check the rooms, list it for sale.
          </p>
        </li>
      </ol>
      <p className="text-sm text-forge-muted">
        Royal Visage goes on map <Fill field={ROYAL_VISAGE_MAP} />. It needs a
        tier 16 non-unique map.
      </p>
    </div>
  );
}

/** Setup checklist: every input with why, required vs optional. */
export function SetupChecklist() {
  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {CHECKLIST.map(item => (
          <li key={item.name} className="panel-inset flex gap-3 p-4">
            <span
              aria-hidden
              className={`mt-0.5 font-bold ${
                item.need === 'required'
                  ? 'text-forge-gold'
                  : 'text-forge-muted'
              }`}
            >
              {item.need === 'required' ? '■' : '□'}
            </span>
            <div className="min-w-0 space-y-1.5">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-forge-goldbright">
                  {item.name}
                </span>
                <Badge tone={item.need === 'required' ? 'accent' : 'neutral'}>
                  {item.need === 'required' ? 'Required' : 'Optional'}
                </Badge>
              </p>
              <p className="text-sm leading-relaxed text-forge-muted">
                <span className="font-medium text-forge-goldbright">Why: </span>
                {item.why}
              </p>
              {item.details?.map(d => (
                <p key={d.label} className="text-sm text-forge-muted">
                  <span className="font-medium text-forge-goldbright">
                    In my setup:{' '}
                  </span>
                  <Fill field={d} />
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <h3 className="display text-lg">Incursion Atlas notables (3.30)</h3>
        <p className="text-sm text-forge-muted">
          The Incursion notables in my tree, plus two I skip. The full
          allocation is in the Atlas tree link at the top.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {NOTABLES.map(n => (
            <div key={n.name} className="panel-inset p-3">
              <dt className="flex flex-wrap items-center gap-2 text-sm font-semibold text-forge-goldbright">
                {n.name}
                <Badge tone={n.inMyTree ? 'success' : 'neutral'}>
                  {n.inMyTree ? '✓ In my tree' : '✕ Not taken'}
                </Badge>
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-forge-muted">
                {n.effect ??
                  'Hover it on the linked Atlas tree for its effect.'}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
