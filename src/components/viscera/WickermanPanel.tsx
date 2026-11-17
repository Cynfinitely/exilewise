'use client';

import { useMemo, useState } from 'react';
import type { VisceraView } from '@/lib/poe1/viscera/browse';
import { tagLabel } from '@/lib/poe1/viscera/tags';
import {
  combineStats,
  formatStat,
  STAT_GROUP_LABELS,
  type RollView,
  type StatGroup,
} from '@/lib/poe1/viscera/totals';
import { VISCERA_SLOTS, type VisceraSlot } from '@/lib/poe1/viscera/types';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatLine, TierBadge } from './parts';
import { BuyLink } from './BuyLink';
import { WickermanFigure } from './WickermanFigure';

export type Equipped = Partial<Record<VisceraSlot, VisceraView>>;

/** `?wm=` value: viscera ids in slot order, empty for a free slot. */
export function shareParam(equipped: Equipped): string {
  return VISCERA_SLOTS.map(s => equipped[s]?.id ?? '').join(',');
}

const GROUP_ORDER: StatGroup[] = ['offence', 'defence', 'utility'];
const GROUP_ACCENT: Record<StatGroup, string> = {
  offence: 'text-ember',
  defence: 'text-aurora-teal',
  utility: 'text-aurora-violet',
};

function CombinedEffect({ equipped }: { equipped: Equipped }) {
  const [view, setView] = useState<RollView>('range');
  const totals = useMemo(() => combineStats(equipped), [equipped]);
  const tags = useMemo(
    () => [...new Set(Object.values(equipped).flatMap(v => v?.tags ?? []))],
    [equipped]
  );
  if (!totals.length) return null;

  return (
    <section aria-labelledby="wm-total" className="space-y-3">
      <div className="ornament">
        <span id="wm-total" className="eyebrow">
          Combined effect
        </span>
      </div>
      <SegmentedControl
        label="Show rolls as"
        value={view}
        onChange={setView}
        options={[
          { value: 'range', label: 'Range' },
          { value: 'min', label: 'Worst roll' },
          { value: 'max', label: 'Perfect roll' },
        ]}
        shortLabels={{ min: 'Min', max: 'Max' }}
      />
      {GROUP_ORDER.map(group => {
        const lines = totals.filter(t => t.group === group);
        if (!lines.length) return null;
        return (
          <div key={group}>
            <h4
              className={`mb-1 font-display text-2xs font-semibold uppercase tracking-[0.16em] ${GROUP_ACCENT[group]}`}
            >
              {STAT_GROUP_LABELS[group]}
            </h4>
            <ul className="space-y-1">
              {lines.map(t => (
                <li
                  key={t.template}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <StatLine text={formatStat(t, view)} />
                  <span className="shrink-0 text-2xs text-forge-muted">
                    {t.slots.length > 1
                      ? `${t.slots.length} slots`
                      : t.slots[0]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {tags.length ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {tags.map(t => (
            <span key={t} className="tag-chip text-2xs">
              {tagLabel(t)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function WickermanPanel({
  equipped,
  onRemove,
  onClear,
  onPickSlot,
}: {
  equipped: Equipped;
  onRemove: (slot: VisceraSlot) => void;
  onClear: () => void;
  /** Jump to browsing this slot. */
  onPickSlot: (slot: VisceraSlot) => void;
}) {
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const filled = VISCERA_SLOTS.filter(s => equipped[s]);

  const share = async () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = 'wickerman';
    url.searchParams.set('wm', shareParam(equipped));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  return (
    <section
      id="wickerman"
      aria-labelledby="wickerman-title"
      className="panel relative scroll-mt-24 overflow-hidden p-5 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-full w-96 bg-[radial-gradient(closest-side,rgb(240_138_60/0.14),transparent)]"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your effigy</p>
          <h2
            id="wickerman-title"
            className="display mt-1 text-2xl sm:text-3xl"
          >
            The Wickerman
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm tracking-[0.14em] text-forge-rust-strong">
            {filled.length} / 4
          </span>
          {filled.length ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={share}
              >
                {copied === 'ok'
                  ? 'Link copied'
                  : copied === 'fail'
                    ? 'Copy failed'
                    : 'Share'}
              </button>
              <button type="button" className="btn btn-sm" onClick={onClear}>
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative mt-6 grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.1fr)]">
        <WickermanFigure
          items={Object.fromEntries(
            filled.map(s => [
              s,
              { name: equipped[s]!.name, icon: equipped[s]!.icon },
            ])
          )}
          onSlot={onPickSlot}
          className="max-w-[200px]"
        />

        <ul className="space-y-2.5">
          {VISCERA_SLOTS.map(slot => {
            const v = equipped[slot];
            return (
              <li
                key={slot}
                className={`rounded-xl border p-3 ${
                  v
                    ? 'border-forge-border/70 bg-forge-bg/40'
                    : 'border-dashed border-forge-border/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-forge-muted">
                    {slot}
                  </span>
                  {v ? <TierBadge tier={v.tier} /> : null}
                  {v ? (
                    <span className="ml-auto">
                      <BuyLink v={v} compact />
                    </span>
                  ) : null}
                  {v ? (
                    <button
                      type="button"
                      onClick={() => onRemove(slot)}
                      className="btn btn-ghost btn-sm tap"
                      aria-label={`Remove ${v.name}`}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
                {v ? (
                  <>
                    <p className="mt-1 font-medium text-forge-goldbright">
                      {v.name}
                    </p>
                    <ul className="mt-0.5 text-xs leading-relaxed">
                      {v.effects.map(e => (
                        <li key={e}>
                          <StatLine text={e} />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <button
                    type="button"
                    className="tap mt-1 text-left text-sm text-forge-muted underline-offset-4 hover:text-forge-rust-strong hover:underline"
                    onClick={() => onPickSlot(slot)}
                  >
                    Empty. Browse {slot.toLowerCase()} viscera →
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="md:col-span-2 xl:col-span-1">
          {filled.length ? (
            <CombinedEffect equipped={equipped} />
          ) : (
            <div className="flex flex-col justify-center rounded-xl border border-dashed border-forge-border/60 p-5 text-sm leading-relaxed text-forge-muted">
              <p className="eyebrow mb-2">Combined effect</p>
              <p>
                Fill a socket and the total of all four viscera appears here,
                with matching stats added together. Tap a socket, equip from the
                list below, or let{' '}
                <em className="not-italic text-forge-goldbright">
                  Suggest for my build
                </em>{' '}
                fill it.
              </p>
            </div>
          )}
          <p className="mt-4 text-2xs leading-relaxed text-forge-muted/80">
            Stats are snapshotted when you open an instance; swap freely in town
            or your hideout. Each character has its own Wickerman. Saved in this
            browser.
          </p>
        </div>
      </div>
    </section>
  );
}
