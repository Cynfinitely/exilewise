import { tagsFor } from './tags';
import {
  VISCERA_SLOTS,
  VISCERA_TIERS,
  type Viscera,
  type VisceraSlot,
  type VisceraSourceKind,
  type VisceraTier,
} from './types';

/** Viscera plus derived fields the UI filters on. */
export interface VisceraView extends Viscera {
  tags: string[];
  /** Lower-cased name + effects + bosses + zones, for search. */
  haystack: string;
  /** Earliest campaign act it drops in, for levelling order. */
  firstAct: number | null;
}

export function toView(v: Viscera): VisceraView {
  const acts = v.sources
    .map(s => s.act)
    .filter((a): a is number => a != null && a >= 1);
  return {
    ...v,
    tags: tagsFor(v),
    haystack: [
      v.name,
      ...v.effects,
      ...v.sources.flatMap(s => [s.boss, s.where]),
    ]
      .join('\n')
      .toLowerCase(),
    firstAct: acts.length ? Math.min(...acts) : null,
  };
}

export interface VisceraFilter {
  q: string;
  slots: VisceraSlot[];
  tiers: VisceraTier[];
  sources: VisceraSourceKind[];
  /** Every listed tag must match. */
  tags: string[];
  /** Only drops up to this act (campaign sources). */
  maxAct: number | null;
}

export const EMPTY_FILTER: VisceraFilter = {
  q: '',
  slots: [],
  tiers: [],
  sources: [],
  tags: [],
  maxAct: null,
};

export function isFilterEmpty(f: VisceraFilter): boolean {
  return (
    !f.q.trim() &&
    !f.slots.length &&
    !f.tiers.length &&
    !f.sources.length &&
    !f.tags.length &&
    f.maxAct == null
  );
}

export function matches(v: VisceraView, f: VisceraFilter): boolean {
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.some(w => !v.haystack.includes(w))) return false;
  if (f.slots.length && !f.slots.includes(v.slot)) return false;
  if (f.tiers.length && !f.tiers.includes(v.tier)) return false;
  if (f.sources.length && !v.sources.some(s => f.sources.includes(s.kind))) {
    return false;
  }
  if (f.tags.some(t => !v.tags.includes(t))) return false;
  if (f.maxAct != null) {
    const ok = v.sources.some(
      s => s.kind === 'campaign' && s.act != null && s.act <= f.maxAct!
    );
    if (!ok) return false;
  }
  return true;
}

export type SortKey = 'act' | 'name' | 'slot';

/** Family = one wiki icon row: lesser → normal → greater (or variants). */
export interface VisceraFamily {
  family: string;
  slot: VisceraSlot;
  icon: string | null;
  members: VisceraView[];
  firstAct: number | null;
}

const tierRank = (t: VisceraTier) => VISCERA_TIERS.indexOf(t);
const slotRank = (s: VisceraSlot) => VISCERA_SLOTS.indexOf(s);

/** Groups matches by family, keeping each family's tiers in order. */
export function groupFamilies(
  list: VisceraView[],
  sort: SortKey
): VisceraFamily[] {
  const map = new Map<string, VisceraFamily>();
  for (const v of list) {
    const key = `${v.slot}|${v.family}`;
    let fam = map.get(key);
    if (!fam) {
      fam = {
        family: v.family,
        slot: v.slot,
        icon: v.icon,
        members: [],
        firstAct: null,
      };
      map.set(key, fam);
    }
    fam.members.push(v);
    if (v.firstAct != null) {
      fam.firstAct =
        fam.firstAct == null ? v.firstAct : Math.min(fam.firstAct, v.firstAct);
    }
  }
  const families = [...map.values()];
  for (const f of families) {
    f.members.sort(
      (a, b) =>
        tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name)
    );
  }
  const byName = (a: VisceraFamily, b: VisceraFamily) =>
    a.family.localeCompare(b.family);
  const cmp: Record<SortKey, (a: VisceraFamily, b: VisceraFamily) => number> = {
    name: byName,
    slot: (a, b) => slotRank(a.slot) - slotRank(b.slot) || byName(a, b),
    // Campaign drops in act order, then maps, then pinnacle/queen.
    act: (a, b) =>
      (a.firstAct ?? 99) - (b.firstAct ?? 99) ||
      tierRank(a.members[0].tier) - tierRank(b.members[0].tier) ||
      byName(a, b),
  };
  return families.sort(cmp[sort]);
}
