import type { VisceraView } from './browse';
import { tagGroup } from './tags';
import {
  VISCERA_SLOTS,
  type VisceraSlot,
  type VisceraSourceKind,
  type VisceraTier,
} from './types';

/**
 * "Suggest for my build": score every obtainable viscera against the build's
 * tags and pick the best one per Wickerman slot.
 */

export interface BuildProfile {
  tags: string[];
  /** Content the player can farm: campaign, maps, pinnacle/uber bosses. */
  progress: 'campaign' | 'maps' | 'pinnacle' | 'uber';
  /** Highest act reached, when progress is campaign. */
  act: number;
}

export interface Suggestion {
  viscera: VisceraView;
  score: number;
  matched: string[];
}

const TIER_BONUS: Record<VisceraTier, number> = {
  lesser: 0,
  normal: 0.5,
  greater: 1,
  pinnacle: 1.5,
  uber: 2,
  queen: 0,
};

const GROUP_WEIGHT = { damage: 3, style: 3, defence: 2, utility: 1 } as const;

/** Whether the player can get this viscera at their progress. */
export function obtainable(v: VisceraView, p: BuildProfile): boolean {
  if (v.tier === 'queen') return false; // random mods: not a planned pick
  const allowed: VisceraSourceKind[] =
    p.progress === 'campaign'
      ? ['campaign']
      : p.progress === 'maps'
        ? ['campaign', 'map']
        : ['campaign', 'map', 'pinnacle'];
  if (v.tier === 'uber' && p.progress !== 'uber') return false;
  return v.sources.some(
    s =>
      allowed.includes(s.kind) &&
      (p.progress !== 'campaign' || s.act == null || s.act <= p.act)
  );
}

/**
 * A viscera whose damage type or play style is entirely outside the build is
 * dead weight (cold damage for a fire build, minion damage for a self-caster).
 */
function conflicts(v: VisceraView, selected: Set<string>): boolean {
  for (const group of ['damage', 'style'] as const) {
    const wanted = [...selected].filter(t => tagGroup(t) === group);
    const has = v.tags.filter(t => tagGroup(t) === group);
    if (wanted.length && has.length && !has.some(t => selected.has(t)))
      return true;
  }
  return false;
}

export function scoreViscera(
  v: VisceraView,
  p: BuildProfile
): Suggestion | null {
  const selected = new Set(p.tags);
  if (!selected.size || conflicts(v, selected)) return null;
  const matched = v.tags.filter(t => selected.has(t));
  if (!matched.length) return null;
  const score =
    matched.reduce((s, t) => s + GROUP_WEIGHT[tagGroup(t) ?? 'utility'], 0) +
    TIER_BONUS[v.tier];
  return { viscera: v, score, matched };
}

export function suggest(
  list: VisceraView[],
  p: BuildProfile,
  perSlot = 4
): Record<VisceraSlot, Suggestion[]> {
  const out = Object.fromEntries(
    VISCERA_SLOTS.map(s => [s, [] as Suggestion[]])
  ) as Record<VisceraSlot, Suggestion[]>;
  for (const v of list) {
    if (!obtainable(v, p)) continue;
    const s = scoreViscera(v, p);
    if (s) out[v.slot].push(s);
  }
  for (const slot of VISCERA_SLOTS) {
    // Best first; one entry per family so alternatives are real alternatives.
    const seen = new Set<string>();
    out[slot] = out[slot]
      .sort(
        (a, b) =>
          b.score - a.score || a.viscera.name.localeCompare(b.viscera.name)
      )
      .filter(s => !seen.has(s.viscera.family) && seen.add(s.viscera.family))
      .slice(0, perSlot);
  }
  return out;
}
