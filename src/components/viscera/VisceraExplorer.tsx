'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EMPTY_FILTER,
  groupFamilies,
  matches,
  toView,
  type SortKey,
  type VisceraFilter,
  type VisceraView,
} from '@/lib/poe1/viscera/browse';
import {
  VISCERA_SLOTS,
  type Viscera,
  type VisceraSlot,
} from '@/lib/poe1/viscera/types';
import {
  browserStorage,
  saveWickerman,
  type WickermanSlots,
} from '@/lib/user/localStore';
import { useWickerman } from '@/lib/user/useLocalStore';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BuildSuggest } from './BuildSuggest';
import { TradeLeagueContext } from './BuyLink';
import { FamilyCard } from './FamilyCard';
import { VisceraFilters } from './VisceraFilters';
import { WickermanPanel, type Equipped } from './WickermanPanel';

const PAGE = 24;
type Tab = 'browse' | 'suggest';

function toIds(equipped: Equipped): WickermanSlots {
  return Object.fromEntries(
    VISCERA_SLOTS.filter(s => equipped[s]).map(s => [s, equipped[s]!.id])
  );
}

export function VisceraExplorer({
  viscera,
  shared,
  league,
}: {
  viscera: Viscera[];
  /** Selected PoE 1 league, for trade links. */
  league: string;
  /** Wickerman from a `?wm=` share link, already validated server-side. */
  shared: WickermanSlots | null;
}) {
  const views = useMemo(() => viscera.map(toView), [viscera]);
  const byId = useMemo(() => new Map(views.map(v => [v.id, v])), [views]);

  const [tab, setTab] = useState<Tab>('browse');
  const [filter, setFilter] = useState<VisceraFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<SortKey>('act');
  const [limit, setLimit] = useState(PAGE);
  const [sharedDismissed, setSharedDismissed] = useState(false);
  // The floating Wickerman pill hides while the panel itself is on screen.
  const [panelInView, setPanelInView] = useState(true);
  useEffect(() => {
    const el = document.getElementById('wickerman');
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPanelInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stored = useWickerman();
  const equipped: Equipped = useMemo(() => {
    const out: Equipped = {};
    for (const slot of VISCERA_SLOTS) {
      const v = stored?.[slot] ? byId.get(stored[slot]!) : undefined;
      if (v && v.slot === slot) out[slot] = v;
    }
    return out;
  }, [stored, byId]);
  const equippedIds = useMemo(
    () => new Set(Object.values(equipped).map(v => v!.id)),
    [equipped]
  );

  const save = (next: Equipped) => saveWickerman(browserStorage(), toIds(next));
  const equip = (v: VisceraView) =>
    save(
      equipped[v.slot]?.id === v.id
        ? { ...equipped, [v.slot]: undefined }
        : { ...equipped, [v.slot]: v }
    );

  const changeFilter = (f: VisceraFilter) => {
    setFilter(f);
    setLimit(PAGE);
  };

  const pickSlot = (slot: VisceraSlot) => {
    setTab('browse');
    changeFilter({ ...EMPTY_FILTER, slots: [slot] });
    document
      .getElementById('viscera-results')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const matching = useMemo(
    () => views.filter(v => matches(v, filter)),
    [views, filter]
  );
  const families = useMemo(
    () => groupFamilies(matching, sort),
    [matching, sort]
  );

  const sharedViews = shared
    ? VISCERA_SLOTS.map(s =>
        shared[s] ? byId.get(shared[s]!) : undefined
      ).filter((v): v is VisceraView => !!v)
    : [];
  const showShared =
    !sharedDismissed &&
    sharedViews.length > 0 &&
    sharedViews.some(v => !equippedIds.has(v.id));

  return (
    <TradeLeagueContext.Provider value={league}>
      <div className="space-y-6 pb-20">
        <WickermanPanel
          equipped={equipped}
          onRemove={slot => save({ ...equipped, [slot]: undefined })}
          onClear={() => save({})}
          onPickSlot={pickSlot}
        />
        <div className="min-w-0 space-y-4">
          {showShared ? (
            <Alert tone="info" title="Someone shared a Wickerman with you">
              {sharedViews.map(v => v.name).join(', ')}.
              <span className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    save(Object.fromEntries(sharedViews.map(v => [v.slot, v])));
                    setSharedDismissed(true);
                  }}
                >
                  Load it (replaces yours)
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSharedDismissed(true)}
                >
                  Dismiss
                </button>
              </span>
            </Alert>
          ) : null}

          <SegmentedControl
            label="View"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'browse', label: 'Browse all viscera' },
              { value: 'suggest', label: 'Suggest for my build' },
            ]}
            shortLabels={{ browse: 'Browse', suggest: 'Suggest' }}
          />

          {tab === 'suggest' ? (
            <BuildSuggest
              viscera={views}
              equipped={equipped}
              onEquip={equip}
              onEquipAll={picks => save({ ...equipped, ...picks })}
            />
          ) : (
            <>
              <VisceraFilters
                filter={filter}
                onChange={changeFilter}
                sort={sort}
                onSort={setSort}
                shown={matching.length}
                total={views.length}
              />
              <div id="viscera-results" className="scroll-mt-24">
                {families.length === 0 ? (
                  <EmptyState
                    title="No viscera match"
                    action={
                      <button
                        type="button"
                        className="btn"
                        onClick={() => changeFilter(EMPTY_FILTER)}
                      >
                        Clear filters
                      </button>
                    }
                  >
                    Try fewer filters or a shorter search.
                  </EmptyState>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {families.slice(0, limit).map(f => (
                      <FamilyCard
                        key={`${f.slot}|${f.family}`}
                        family={f}
                        equipped={equipped}
                        onEquip={equip}
                      />
                    ))}
                  </div>
                )}
                {families.length > limit ? (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setLimit(l => l + PAGE)}
                    >
                      Show more ({families.length - limit} left)
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Floating way back to the Wickerman from deep in the list. */}
        <a
          href="#wickerman"
          aria-hidden={panelInView}
          tabIndex={panelInView ? -1 : undefined}
          className={`${panelInView ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'} fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-4 rounded-full border border-forge-gold/40 bg-forge-bg/90 px-5 py-2.5 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.9)] backdrop-blur-md transition-all duration-300 hover:border-forge-gold`}
        >
          <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-goldbright">
            Wickerman
          </span>
          <span
            className="flex items-center gap-1.5"
            aria-label={`${equippedIds.size} of 4 slots filled`}
          >
            {VISCERA_SLOTS.map(s => (
              <span
                key={s}
                className={`h-2 w-2 rotate-45 border border-forge-gold/70 ${equipped[s] ? 'bg-forge-gold shadow-[0_0_8px_rgb(240_138_60/0.8)]' : ''}`}
              />
            ))}
          </span>
        </a>
      </div>
    </TradeLeagueContext.Provider>
  );
}
