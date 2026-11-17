import { tagGroup, tagsFor } from './tags';
import type { Viscera, VisceraSlot } from './types';

/**
 * Combined effect of an equipped Wickerman. Stat lines with the same wording
 * ("#% increased Area of Effect") are merged and their numbers summed, so
 * the panel reads like the character sheet would.
 *
 * Additive stats ("increased", flat "+#") are summed; "#% more" lines
 * compound multiplicatively, as they do in game.
 */

export type StatGroup = 'offence' | 'defence' | 'utility';
export type RollView = 'range' | 'min' | 'max';

export interface StatTotal {
  /** Line with "#" where the numbers go. */
  template: string;
  /** Summed [min, max] per number in the line. */
  values: [number, number][];
  group: StatGroup;
  /** Slots contributing to this line. */
  slots: VisceraSlot[];
}

// "(10-15)" or "(-5--3)" ranges, or single numbers like "25" / "1.6".
const NUMBER = /\((-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)\)|(-?\d+(?:\.\d+)?)/g;

export function splitStat(line: string): {
  template: string;
  values: [number, number][];
} {
  const values: [number, number][] = [];
  const template = line.replace(NUMBER, (_m, lo, hi, single) => {
    if (single != null) values.push([Number(single), Number(single)]);
    else values.push([Number(lo), Number(hi)]);
    return '#';
  });
  return { template, values };
}

/**
 * Sustain lines are defence. A damage type makes a line offence. Otherwise a defence stat wins over a
 * play style ("Minions Recover 3% of Life" is defence), and a play style
 * alone ("Minions deal 20% increased Damage") is offence.
 */
const SUSTAIN = /\b(Recover|Regenerate|Leech|Recoup)/i;

function groupOf(line: string): StatGroup {
  const groups = tagsFor({ effects: [line] }).map(tagGroup);
  // "Recover Life on Killing a Poisoned Enemy": the poison is the trigger,
  // the benefit is sustain.
  if (groups.includes('defence') && SUSTAIN.test(line)) return 'defence';
  if (groups.includes('damage')) return 'offence';
  if (groups.includes('defence')) return 'defence';
  if (groups.includes('style')) return 'offence';
  return 'utility';
}

const round = (n: number) => Math.round(n * 100) / 100;

export function combineStats(
  equipped: Partial<Record<VisceraSlot, Pick<Viscera, 'effects'>>>
): StatTotal[] {
  const byTemplate = new Map<string, StatTotal>();
  for (const [slot, v] of Object.entries(equipped) as [
    VisceraSlot,
    Pick<Viscera, 'effects'> | undefined,
  ][]) {
    if (!v) continue;
    for (const line of v.effects) {
      const { template, values } = splitStat(line);
      const prev = byTemplate.get(template);
      if (prev && prev.values.length === values.length) {
        const more = /#% more\b/i.test(template);
        const add = (a: number, b: number) =>
          more ? ((1 + a / 100) * (1 + b / 100) - 1) * 100 : a + b;
        prev.values = prev.values.map(([lo, hi], i) => [
          round(add(lo, values[i][0])),
          round(add(hi, values[i][1])),
        ]);
        if (!prev.slots.includes(slot)) prev.slots.push(slot);
      } else {
        byTemplate.set(template, {
          template,
          values,
          group: groupOf(line),
          slots: [slot],
        });
      }
    }
  }
  return [...byTemplate.values()];
}

/** Puts numbers back into a template for display. */
export function formatStat(
  total: Pick<StatTotal, 'template' | 'values'>,
  view: RollView
): string {
  let i = 0;
  return total.template.replace(/#/g, () => {
    const [lo, hi] = total.values[i++] ?? [0, 0];
    if (lo === hi) return String(lo);
    if (view === 'min') return String(lo);
    if (view === 'max') return String(hi);
    return `(${lo}-${hi})`;
  });
}

export const STAT_GROUP_LABELS: Record<StatGroup, string> = {
  offence: 'Offence',
  defence: 'Defence',
  utility: 'Utility',
};
