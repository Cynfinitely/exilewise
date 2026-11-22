/**
 * Temple farm profit maths. Pure and client-safe: the calculator component
 * renders whatever this returns, and tests/templeGuide.test.ts pins it.
 *
 * Values are computed in a base unit: chaos when a usable exchange rate is
 * given, otherwise the one unit every non-zero input shares. When inputs mix
 * chaos and divines without a rate, nothing can be converted and the result
 * says so (`needsRate`) instead of guessing a rate.
 */

export type Unit = 'c' | 'div';

export interface Money {
  amount: number;
  unit: Unit;
}

export interface ProfitInput {
  /** Maps run for this Temple. */
  maps: number;
  /** Cost of one map. */
  mapCost: Money;
  /** Threads spent in total, across every map. */
  threads: number;
  /** Cost of one Thread. */
  threadCost: Money;
  /** Other consumables in total (device crafts, map mods, …). */
  otherCosts: Money;
  /** Royal Visage cost (its market value, even if it was your own drop). */
  royalVisage: Money;
  /** What the Temple actually sold for, gross. */
  templeSale: Money;
  /** Other loot sold or valued from the same maps and Temple. */
  otherLoot: Money;
  /** Wall-clock minutes for the whole loop, including the Temple. */
  minutes: number;
  /** Chaos Orbs per Divine Orb. Non-positive or NaN means "not entered". */
  chaosPerDivine: number;
}

export interface LineItem {
  label: string;
  /** Signed, in the base unit: income positive, costs negative. */
  value: number;
}

export interface ProfitResult {
  /** Unit every value below is in. */
  base: Unit;
  /** Chaos per divine, or null when no usable rate was entered. */
  rate: number | null;
  /** Inputs mix chaos and divines but no rate was entered: totals are unusable. */
  needsRate: boolean;
  lines: LineItem[];
  gross: number;
  cost: number;
  net: number;
  /** Null when no maps were entered. */
  perMap: number | null;
  /** Null when time is zero, negative or missing. */
  perHour: number | null;
}

/** Non-finite or negative inputs count as 0. */
const clean = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeProfit(input: ProfitInput): ProfitResult {
  const rate =
    Number.isFinite(input.chaosPerDivine) && input.chaosPerDivine > 0
      ? input.chaosPerDivine
      : null;
  const maps = Math.floor(clean(input.maps));
  const threads = Math.floor(clean(input.threads));

  const used = [
    input.templeSale,
    input.otherLoot,
    input.royalVisage,
    input.otherCosts,
    ...(maps > 0 ? [input.mapCost] : []),
    ...(threads > 0 ? [input.threadCost] : []),
  ].filter(m => clean(m.amount) > 0);
  const units = new Set(used.map(m => m.unit));
  const base: Unit = rate !== null ? 'c' : units.has('div') ? 'div' : 'c';
  const needsRate = rate === null && units.size > 1;

  const v = (m: Money) => {
    const amount = clean(m.amount);
    if (m.unit === base) return amount;
    if (rate === null) return 0; // only reached when needsRate is true
    return m.unit === 'div' ? amount * rate : amount / rate;
  };

  const lines: LineItem[] = [
    { label: 'Temple sale (gross)', value: v(input.templeSale) },
    { label: 'Other loot', value: v(input.otherLoot) },
    { label: `Maps (${maps} × map cost)`, value: -maps * v(input.mapCost) },
    {
      label: `Threads (${threads} × Thread cost)`,
      value: -threads * v(input.threadCost),
    },
    { label: 'Royal Visage', value: -v(input.royalVisage) },
    { label: 'Other consumables', value: -v(input.otherCosts) },
  ];

  const gross = lines.reduce((s, l) => s + Math.max(0, l.value), 0);
  const cost = lines.reduce((s, l) => s + Math.max(0, -l.value), 0);
  const net = gross - cost;
  const minutes = clean(input.minutes);

  return {
    base,
    rate,
    needsRate,
    lines,
    gross,
    cost,
    net,
    perMap: maps > 0 ? net / maps : null,
    perHour: minutes > 0 ? (net / minutes) * 60 : null,
  };
}

/**
 * A base-unit value shown in `unit`: "1,234c" or "4.25 div". Returns null
 * when it would need a conversion and no rate is known.
 */
export function formatMoney(
  value: number,
  base: Unit,
  unit: Unit,
  rate: number | null
): string | null {
  let n = value;
  if (unit !== base) {
    if (rate === null) return null;
    n = unit === 'div' ? value / rate : value * rate;
  }
  // Avoid "-0c" for an exact zero.
  if (Object.is(n, -0)) n = 0;
  return unit === 'div'
    ? `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} div`
    : `${Math.round(n).toLocaleString('en-US')}c`;
}
