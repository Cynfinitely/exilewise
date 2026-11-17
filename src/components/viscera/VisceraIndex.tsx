import {
  VISCERA_SLOTS,
  VISCERA_TIERS,
  type Viscera,
} from '@/lib/poe1/viscera/types';
import { TIER_META } from './parts';

function where(v: Viscera): string {
  return v.sources
    .map(s => {
      if (s.kind === 'campaign')
        return `${s.boss} (${s.act ? `Act ${s.act}, ` : ''}${s.where})`;
      if (s.kind === 'map')
        return `${s.boss} (${/ map$/i.test(s.where) ? s.where : `${s.where} map`})`;
      return `${s.boss} (${s.where})`;
    })
    .join('; ');
}

/**
 * Server-rendered reference table of every viscera. The explorer above pages
 * its cards on the client; this keeps the full list in the HTML for readers
 * who want everything at once and for search engines.
 */
export function VisceraIndex({ viscera }: { viscera: Viscera[] }) {
  const rows = [...viscera].sort(
    (a, b) =>
      VISCERA_SLOTS.indexOf(a.slot) - VISCERA_SLOTS.indexOf(b.slot) ||
      a.family.localeCompare(b.family) ||
      VISCERA_TIERS.indexOf(a.tier) - VISCERA_TIERS.indexOf(b.tier)
  );
  return (
    <section aria-labelledby="viscera-index" className="panel p-4 sm:p-6">
      <details className="group">
        <summary className="tap flex cursor-pointer items-center justify-between gap-3">
          <h2 id="viscera-index" className="display text-xl sm:text-2xl">
            All {viscera.length} viscera at a glance
          </h2>
          <span className="shrink-0 text-sm text-forge-rust-strong">
            <span className="group-open:hidden">Show table</span>
            <span className="hidden group-open:inline">Hide table</span>
          </span>
        </summary>
        <p className="mt-3 text-sm text-forge-muted">
          Every Path of Exile Covens viscera by Wickerman slot, with its tier,
          stats and the bosses that drop it.
        </p>
        <div className="table-scroll mt-4">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Path of Exile Covens viscera: slot, tier, stats and drop sources
            </caption>
            <thead>
              <tr className="border-b border-forge-border text-xs uppercase tracking-wide text-forge-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Viscera
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Slot
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Tier
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Stats
                </th>
                <th scope="col" className="py-2 font-medium">
                  Drops from
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => (
                <tr
                  key={v.id}
                  className="border-b border-forge-border/40 align-top"
                >
                  <th
                    scope="row"
                    className="py-2 pr-3 font-medium text-forge-goldbright"
                  >
                    {v.name}
                  </th>
                  <td className="py-2 pr-3 text-forge-muted">{v.slot}</td>
                  <td className="py-2 pr-3 text-forge-muted">
                    {TIER_META[v.tier].label}
                  </td>
                  <td className="py-2 pr-3 text-rarity-magic">
                    {v.effects.join(' / ')}
                  </td>
                  <td className="py-2 text-forge-muted">{where(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
