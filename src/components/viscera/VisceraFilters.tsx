'use client';

import {
  EMPTY_FILTER,
  isFilterEmpty,
  type SortKey,
  type VisceraFilter,
} from '@/lib/poe1/viscera/browse';
import { TAG_GROUP_LABELS, TAGS, type TagGroup } from '@/lib/poe1/viscera/tags';
import { VISCERA_SLOTS, VISCERA_TIERS } from '@/lib/poe1/viscera/types';
import { SlotIcon, SOURCE_LABELS, TIER_META } from './parts';

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`tap inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? 'border-forge-gold/80 bg-forge-gold/15 text-forge-rust-strong shadow-[0_0_12px_-4px_rgb(201_163_95/0.7)]'
          : 'border-forge-border bg-forge-bg/40 text-forge-muted hover:border-forge-gold/50 hover:text-forge-goldbright'
      }`}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter(x => x !== v) : [...list, v];
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="label mb-1.5">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

const SOURCE_KINDS = Object.keys(
  SOURCE_LABELS
) as (keyof typeof SOURCE_LABELS)[];
const TAG_GROUPS = Object.keys(TAG_GROUP_LABELS) as TagGroup[];

export function VisceraFilters({
  filter,
  onChange,
  sort,
  onSort,
  shown,
  total,
}: {
  filter: VisceraFilter;
  onChange: (f: VisceraFilter) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  shown: number;
  total: number;
}) {
  const set = (patch: Partial<VisceraFilter>) =>
    onChange({ ...filter, ...patch });

  return (
    <section aria-label="Filter viscera" className="panel space-y-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search viscera</span>
          <input
            type="search"
            value={filter.q}
            onChange={e => set({ q: e.target.value })}
            placeholder="Search name, stat, boss or zone… e.g. ignite, spectre, Act 3"
            className="input pl-9"
            maxLength={80}
          />
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forge-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
          </svg>
        </label>
        <label className="flex items-center gap-2 text-sm text-forge-muted">
          Sort
          <select
            value={sort}
            onChange={e => onSort(e.target.value as SortKey)}
            className="input tap w-auto py-1.5"
          >
            <option value="act">Levelling order</option>
            <option value="slot">Slot</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Group label="Wickerman slot">
          {VISCERA_SLOTS.map(s => (
            <Chip
              key={s}
              active={filter.slots.includes(s)}
              onClick={() => set({ slots: toggle(filter.slots, s) })}
            >
              <SlotIcon slot={s} className="h-3.5 w-3.5" />
              {s}
            </Chip>
          ))}
        </Group>
        <Group label="Tier">
          {VISCERA_TIERS.map(t => (
            <Chip
              key={t}
              active={filter.tiers.includes(t)}
              onClick={() => set({ tiers: toggle(filter.tiers, t) })}
            >
              {TIER_META[t].label}
            </Chip>
          ))}
        </Group>
        <Group label="Drops from">
          {SOURCE_KINDS.map(k => (
            <Chip
              key={k}
              active={filter.sources.includes(k)}
              onClick={() => set({ sources: toggle(filter.sources, k) })}
            >
              {SOURCE_LABELS[k]}
            </Chip>
          ))}
        </Group>
        <fieldset>
          <legend className="label mb-1.5">Campaign progress</legend>
          <select
            value={filter.maxAct ?? ''}
            onChange={e =>
              set({ maxAct: e.target.value ? Number(e.target.value) : null })
            }
            className="input tap w-auto py-1.5"
          >
            <option value="">Any act</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(a => (
              <option key={a} value={a}>
                Drops by Act {a}
              </option>
            ))}
          </select>
        </fieldset>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-forge-rust-strong">
          Build tags{filter.tags.length ? ` (${filter.tags.length})` : ''}
        </summary>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {TAG_GROUPS.map(g => (
            <Group key={g} label={TAG_GROUP_LABELS[g]}>
              {TAGS.filter(t => t.group === g).map(t => (
                <Chip
                  key={t.id}
                  active={filter.tags.includes(t.id)}
                  onClick={() => set({ tags: toggle(filter.tags, t.id) })}
                >
                  {t.label}
                </Chip>
              ))}
            </Group>
          ))}
        </div>
      </details>

      <div className="flex items-center justify-between border-t border-forge-border/70 pt-3 text-sm">
        <p className="text-forge-muted" aria-live="polite">
          <b className="text-forge-goldbright">{shown}</b> of {total} viscera
        </p>
        {!isFilterEmpty(filter) ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange(EMPTY_FILTER)}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
