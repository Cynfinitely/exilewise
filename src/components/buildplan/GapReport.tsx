import { Alert } from '@/components/ui/Alert';
import type { BuildGap, ItemStatus } from '@/lib/buildplan/gap';
import { fmt } from '@/lib/buildplan/prompt';
import type { BuildSummary, PriceReport } from '@/lib/buildplan/types';

const STATUS: Record<ItemStatus, { label: string; cls: string }> = {
  same: { label: 'Done', cls: 'border-success-border text-success-fg' },
  similar: { label: 'Check rolls', cls: 'border-info-border text-info-fg' },
  swap: { label: 'Replace', cls: 'border-warn-border text-warn-fg' },
  new: { label: 'New', cls: 'border-warn-border text-warn-fg' },
  drop: { label: 'Remove', cls: 'border-forge-border text-forge-muted' },
};

function Who({ b, title }: { b: BuildSummary; title: string }) {
  return (
    <div className="panel-inset p-4">
      <p className="section-title">{title}</p>
      <p className="display mt-2 text-xl">
        {b.ascendancy ?? b.className}{' '}
        <span className="text-base text-forge-muted">lvl {b.level}</span>
      </p>
      <p className="mt-1 text-sm text-forge-muted">
        {b.mainSkill ?? 'Main skill unknown'}
        {b.setTitles.items ? ` · ${b.setTitles.items}` : ''}
      </p>
    </div>
  );
}

/** Side-by-side gap between the two builds, shown before the prompt. */
export function GapReport({
  current,
  target,
  gap,
  prices,
}: {
  current: BuildSummary;
  target: BuildSummary;
  gap: BuildGap;
  prices: PriceReport;
}) {
  const changes = gap.items.filter(i => i.status !== 'same');
  const toBuy = prices.entries.filter(e => !e.owned);
  const total = toBuy.reduce((s, e) => s + e.divine, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Who b={current} title="You now" />
        <Who b={target} title="Your goal" />
      </div>

      {gap.classChange !== 'none' ? (
        <Alert tone="warn" title="Different character">
          The target is a different {gap.classChange}. You can’t respec into it;
          the plan will assume a new character.
        </Alert>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="gap-stats" className="space-y-3">
          <h3 id="gap-stats" className="section-title">
            PoB numbers
          </h3>
          <table className="w-full text-sm">
            <thead className="text-left text-2xs uppercase tracking-wider text-forge-muted">
              <tr>
                <th className="py-1 font-medium">Stat</th>
                <th className="py-1 text-right font-medium">Now</th>
                <th className="py-1 text-right font-medium">Goal</th>
                <th className="py-1 text-right font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {gap.stats.map(s => (
                <tr key={s.key} className="border-t border-forge-border/50">
                  <th scope="row" className="py-1.5 text-left font-normal">
                    {s.label}
                  </th>
                  <td className="py-1.5 text-right tabular-nums text-forge-muted">
                    {fmt(s.current, s.unit)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {fmt(s.target, s.unit)}
                  </td>
                  <td
                    className={`py-1.5 text-right tabular-nums ${
                      s.delta === null || s.delta === 0
                        ? 'text-forge-muted'
                        : s.delta > 0
                          ? 'text-success-fg'
                          : 'text-danger-fg'
                    }`}
                  >
                    {s.delta === null
                      ? '–'
                      : `${s.delta > 0 ? '+' : ''}${fmt(s.delta, s.unit)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-2xs text-forge-muted">
            Numbers come from each PoB export and depend on its settings (buffs,
            charges, enemy type).
          </p>
        </section>

        <section aria-labelledby="gap-gear" className="space-y-3">
          <h3 id="gap-gear" className="section-title">
            Gear ({gap.items.length - changes.length} of {gap.items.length}{' '}
            done)
          </h3>
          <ul className="space-y-1.5 text-sm">
            {changes.map((i, n) => (
              <li
                key={`${i.slot}-${n}`}
                className="flex items-start gap-3 border-t border-forge-border/50 pt-1.5"
              >
                <span className="w-24 shrink-0 text-forge-muted">{i.slot}</span>
                <span className="min-w-0 flex-1">
                  <span className="text-forge-muted">
                    {i.current?.name ?? 'empty'}
                  </span>{' '}
                  <span aria-hidden>→</span>
                  <span className="sr-only">to</span>{' '}
                  <span
                    className={
                      i.target?.rarity === 'UNIQUE' ? 'text-rarity-unique' : ''
                    }
                  >
                    {i.target?.name ?? 'nothing'}
                  </span>
                  {i.needsLinks ? (
                    <span className="text-forge-muted">
                      {' '}
                      · needs {i.needsLinks}-link
                    </span>
                  ) : null}
                </span>
                <span className={`badge ${STATUS[i.status].cls}`}>
                  {STATUS[i.status].label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="gap-gems" className="space-y-3 text-sm">
          <h3 id="gap-gems" className="section-title">
            Gems & passive tree
          </h3>
          <p>
            <span className="text-forge-muted">Gems to get: </span>
            {gap.gems.added.join(', ') || 'none'}
          </p>
          {gap.gems.upgrades.length ? (
            <p>
              <span className="text-forge-muted">To level up: </span>
              {gap.gems.upgrades
                .map(u => `${u.name} (${u.from.level}→${u.to.level})`)
                .join(', ')}
            </p>
          ) : null}
          <p>
            <span className="text-forge-muted">No longer used: </span>
            {gap.gems.removed.join(', ') || 'none'}
          </p>
          <p>
            <span className="text-forge-muted">Passive tree: </span>
            {gap.tree.toAllocate} points to allocate, {gap.tree.toRemove} to
            refund ({gap.tree.current} → {gap.tree.target} nodes)
            {target.treeUrl ? (
              <>
                {' · '}
                <a
                  href={target.treeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forge-rust-strong underline-offset-4 hover:underline"
                >
                  open goal tree<span className="sr-only"> (new tab)</span>
                </a>
              </>
            ) : null}
          </p>
        </section>

        <section aria-labelledby="gap-prices" className="space-y-3 text-sm">
          <h3 id="gap-prices" className="section-title">
            Live prices{prices.available ? ` · ${prices.league}` : ''}
          </h3>
          {prices.available ? (
            <>
              <ul className="space-y-1">
                {prices.entries.slice(0, 12).map(e => (
                  <li
                    key={`${e.kind}-${e.name}-${e.detail}`}
                    className={`flex justify-between gap-3 ${e.owned ? 'text-forge-muted line-through' : ''}`}
                  >
                    <span className="min-w-0 truncate">
                      {e.name}
                      {e.detail ? (
                        <span className="text-forge-muted"> · {e.detail}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {e.divine >= 1 ? `${e.divine} div` : `${e.chaos} c`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-forge-border/50 pt-2 font-medium">
                Still to buy: ≈ {Math.round(total * 10) / 10} div
                <span className="font-normal text-forge-muted">
                  {' '}
                  (uniques and gems; rares not included)
                </span>
              </p>
            </>
          ) : (
            <p className="text-forge-muted">{prices.note}</p>
          )}
        </section>
      </div>
    </div>
  );
}
