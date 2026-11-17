'use client';

import { useMemo, useState } from 'react';
import type { VisceraView } from '@/lib/poe1/viscera/browse';
import { suggest, type BuildProfile } from '@/lib/poe1/viscera/suggest';
import {
  BUILD_PRESETS,
  TAG_GROUP_LABELS,
  TAGS,
  tagLabel,
  type TagGroup,
} from '@/lib/poe1/viscera/tags';
import { VISCERA_SLOTS, type VisceraSlot } from '@/lib/poe1/viscera/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { BuyLink } from './BuyLink';
import { EquipButton } from './FamilyCard';
import { Chip } from './VisceraFilters';
import type { Equipped } from './WickermanPanel';
import { SlotIcon, StatLine, TierBadge, VisceraIcon } from './parts';

const PROGRESS: { value: BuildProfile['progress']; label: string }[] = [
  { value: 'campaign', label: 'Still in the campaign' },
  { value: 'maps', label: 'Mapping' },
  { value: 'pinnacle', label: 'Killing pinnacle bosses' },
  { value: 'uber', label: 'Killing uber bosses' },
];

const TAG_GROUPS = Object.keys(TAG_GROUP_LABELS) as TagGroup[];

export function BuildSuggest({
  viscera,
  equipped,
  onEquip,
  onEquipAll,
}: {
  viscera: VisceraView[];
  equipped: Equipped;
  onEquip: (v: VisceraView) => void;
  onEquipAll: (picks: Partial<Record<VisceraSlot, VisceraView>>) => void;
}) {
  const [profile, setProfile] = useState<BuildProfile>({
    tags: [],
    progress: 'maps',
    act: 10,
  });
  const [preset, setPreset] = useState<string | null>(null);
  const results = useMemo(() => suggest(viscera, profile), [viscera, profile]);
  const best = Object.fromEntries(
    VISCERA_SLOTS.map(s => [s, results[s][0]?.viscera]).filter(([, v]) => v)
  ) as Partial<Record<VisceraSlot, VisceraView>>;

  const toggleTag = (id: string) => {
    setPreset(null);
    setProfile(p => ({
      ...p,
      tags: p.tags.includes(id)
        ? p.tags.filter(t => t !== id)
        : [...p.tags, id],
    }));
  };

  return (
    <div className="space-y-4">
      <section className="panel space-y-4 p-4" aria-label="Describe your build">
        <div>
          <h2 className="text-lg font-semibold text-forge-goldbright">
            Describe your build
          </h2>
          <p className="text-sm text-forge-muted">
            Start from a preset or pick what your build does. Suggestions skip
            viscera for damage types or play styles you don’t use.
          </p>
        </div>
        <fieldset>
          <legend className="label mb-1.5">Presets</legend>
          <div className="flex flex-wrap gap-1.5">
            {BUILD_PRESETS.map(p => (
              <Chip
                key={p.id}
                active={preset === p.id}
                onClick={() => {
                  setPreset(p.id);
                  setProfile(prev => ({ ...prev, tags: p.tags }));
                }}
              >
                {p.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 md:grid-cols-2">
          {TAG_GROUPS.map(g => (
            <fieldset key={g}>
              <legend className="label mb-1.5">{TAG_GROUP_LABELS[g]}</legend>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.filter(t => t.group === g).map(t => (
                  <Chip
                    key={t.id}
                    active={profile.tags.includes(t.id)}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="label flex flex-col gap-1">
            Where are you?
            <select
              className="input tap w-auto py-1.5"
              value={profile.progress}
              onChange={e =>
                setProfile(p => ({
                  ...p,
                  progress: e.target.value as BuildProfile['progress'],
                }))
              }
            >
              {PROGRESS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {profile.progress === 'campaign' ? (
            <label className="label flex flex-col gap-1">
              Highest act reached
              <select
                className="input tap w-auto py-1.5"
                value={profile.act}
                onChange={e =>
                  setProfile(p => ({ ...p, act: Number(e.target.value) }))
                }
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(a => (
                  <option key={a} value={a}>
                    Act {a}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </section>

      {!profile.tags.length ? (
        <EmptyState title="Pick a preset or a few tags">
          Suggestions appear here, one shortlist per Wickerman slot.
        </EmptyState>
      ) : (
        <section aria-label="Suggestions" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-forge-muted">
              Best matches for{' '}
              <b className="text-forge-goldbright">
                {profile.tags.map(tagLabel).join(', ')}
              </b>
            </p>
            {Object.keys(best).length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onEquipAll(best)}
              >
                Put top picks on my Wickerman
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {VISCERA_SLOTS.map(slot => (
              <div key={slot} className="panel p-4">
                <h3 className="mb-2 flex items-center gap-1.5 font-semibold text-forge-goldbright">
                  <SlotIcon slot={slot} /> {slot}
                </h3>
                {results[slot].length ? (
                  <ol className="space-y-2.5">
                    {results[slot].map(({ viscera: v, matched }, i) => (
                      <li
                        key={v.id}
                        className={`flex items-start gap-2.5 ${i ? 'border-t border-forge-border/70 pt-2.5' : ''}`}
                      >
                        <VisceraIcon icon={v.icon} slot={v.slot} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-forge-goldbright">
                            {i === 0 ? (
                              <span className="text-2xs font-bold uppercase text-success-fg">
                                Top pick
                              </span>
                            ) : null}
                            {v.name} <TierBadge tier={v.tier} />
                          </p>
                          <ul className="text-xs">
                            {v.effects.map(e => (
                              <li key={e}>
                                <StatLine text={e} />
                              </li>
                            ))}
                          </ul>
                          <p className="mt-0.5 text-2xs text-forge-muted">
                            Matches {matched.map(tagLabel).join(', ')} ·{' '}
                            {v.sources[0]?.boss}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <EquipButton
                            v={v}
                            equipped={equipped}
                            onEquip={onEquip}
                            compact
                          />
                          <BuyLink v={v} compact />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-forge-muted">
                    Nothing for this slot matches your build at this progress.
                    Try adding a defence or utility tag.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
