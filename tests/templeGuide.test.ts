import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fill, isFill, missingFields } from '../src/lib/poe1/guides/fill';
import {
  CHECKLIST,
  LOOP,
  QUICK_START,
} from '../src/lib/poe1/guides/temple/content';
import { EXAMPLES } from '../src/lib/poe1/guides/temple/decisions';
import {
  CHAOS_PER_DIVINE,
  GUIDE,
  LOOP_DEFAULTS,
  PRICES,
} from '../src/lib/poe1/guides/temple/meta';
import {
  computeProfit,
  formatMoney,
  type ProfitInput,
} from '../src/lib/poe1/guides/temple/profit';

const zero = { amount: 0, unit: 'c' } as const;

/** The featured example: 4 div gross, three maps, eight Threads each, no costs yet. */
const featured: ProfitInput = {
  maps: 3,
  mapCost: zero,
  threads: 24,
  threadCost: zero,
  otherCosts: zero,
  royalVisage: zero,
  templeSale: { amount: 4, unit: 'div' },
  otherLoot: zero,
  minutes: 0,
  chaosPerDivine: Number.NaN,
};

test('4 div gross with no rate and zero minutes: totals in div, no per-hour', () => {
  const r = computeProfit(featured);
  assert.equal(r.base, 'div');
  assert.equal(r.needsRate, false);
  assert.equal(r.gross, 4);
  assert.equal(r.net, 4);
  assert.ok(Math.abs((r.perMap ?? 0) - 4 / 3) < 1e-9);
  assert.equal(r.perHour, null);
  assert.equal(formatMoney(r.net, r.base, 'div', r.rate), '4 div');
  assert.equal(formatMoney(r.net, r.base, 'c', r.rate), null);
});

test('4 div gross with a rate, costs and time: chaos maths and per-hour', () => {
  const r = computeProfit({
    ...featured,
    chaosPerDivine: 200,
    mapCost: { amount: 10, unit: 'c' },
    threadCost: { amount: 5, unit: 'c' },
    royalVisage: { amount: 100, unit: 'c' },
    otherCosts: { amount: 30, unit: 'c' },
    minutes: 45,
  });
  assert.equal(r.base, 'c');
  assert.equal(r.gross, 800);
  assert.equal(r.cost, 30 + 120 + 100 + 30);
  assert.equal(r.net, 520);
  assert.ok(Math.abs((r.perMap ?? 0) - 520 / 3) < 1e-9);
  assert.ok(Math.abs((r.perHour ?? 0) - 520 * (60 / 45)) < 1e-9);
  assert.equal(formatMoney(r.net, r.base, 'div', r.rate), '2.6 div');
  assert.equal(formatMoney(r.net, r.base, 'c', r.rate), '520c');
});

test('missing or invalid time never yields NaN or Infinity', () => {
  for (const minutes of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const r = computeProfit({ ...featured, minutes });
    assert.equal(r.perHour, null, `minutes=${minutes}`);
    assert.ok(Number.isFinite(r.net));
  }
});

test('zero maps gives no per-map figure', () => {
  const r = computeProfit({ ...featured, maps: 0 });
  assert.equal(r.perMap, null);
  assert.equal(r.net, 4);
});

test('mixed units without a rate ask for the rate instead of guessing', () => {
  const r = computeProfit({ ...featured, mapCost: { amount: 10, unit: 'c' } });
  assert.equal(r.needsRate, true);
});

test('costs above the sale give a negative net', () => {
  const r = computeProfit({
    ...featured,
    chaosPerDivine: 100,
    threadCost: { amount: 20, unit: 'c' },
    minutes: 30,
  });
  assert.equal(r.net, 400 - 480);
  assert.ok((r.perHour ?? 0) < 0);
  assert.equal(formatMoney(r.net, r.base, 'c', r.rate), '-80c');
});

test('the featured price is a dated gross example of 4 div', () => {
  assert.equal(PRICES.featured.amountDiv, 4);
  assert.equal(PRICES.featured.gross, true);
  assert.match(PRICES.featured.date, /^\d{4}-\d{2}-\d{2}$/);
});

test('missingFields lists unfilled fields once and skips filled ones', () => {
  const data = { a: fill('A'), b: [fill('B', 'set'), { c: fill('A') }] };
  assert.deepEqual(missingFields(data), ['A']);
  assert.ok(isFill(data.a));
});

test('headline content contains no placeholders', () => {
  assert.deepEqual(missingFields(QUICK_START), []);
  assert.deepEqual(missingFields(LOOP), []);
  assert.equal(typeof GUIDE.videoTitle, 'string');
});

test('every checklist item and example explains itself', () => {
  for (const item of CHECKLIST) assert.ok(item.why.length > 20, item.name);
  for (const ex of EXAMPLES) {
    assert.ok(ex.architect.answer && ex.door.answer, ex.id);
    const shot = ex.screenshot.value;
    if (shot) {
      assert.match(
        shot.src,
        /^\/poe1\/guides\/temple-of-atzoatl\/[a-z0-9-]+\.png$/
      );
      assert.ok(
        fs.existsSync(path.join('public', shot.src)),
        `${shot.src} exists`
      );
      assert.ok(shot.alt.length > 40 && shot.width > 0 && shot.height > 0);
    }
    const diagram = ex.diagram;
    if (!diagram) {
      assert.ok(shot, `${ex.id} needs a screenshot or a diagram`);
      continue;
    }
    const ids = new Set(diagram.rooms.map(r => r.id));
    assert.ok(ids.has('entrance'), `${ex.id} has an entrance`);
    for (const d of diagram.doors) {
      assert.ok(
        ids.has(d.from) && ids.has(d.to),
        `${ex.id} door ${d.from}-${d.to}`
      );
    }
  }
});

test('calculator defaults reproduce the featured worked example', () => {
  const rate = CHAOS_PER_DIVINE.value ?? Number.NaN;
  const c = (n: number | null) => ({ amount: n ?? 0, unit: 'c' as const });
  const r = computeProfit({
    maps: LOOP_DEFAULTS.maps,
    threads: LOOP_DEFAULTS.maps * LOOP_DEFAULTS.threadsPerMap,
    mapCost: c(LOOP_DEFAULTS.mapCostChaos.value),
    threadCost: c(LOOP_DEFAULTS.threadCostChaos.value),
    royalVisage: c(LOOP_DEFAULTS.royalVisageChaos.value),
    otherCosts: c(LOOP_DEFAULTS.otherCostsChaos.value),
    templeSale: { amount: PRICES.featured.amountDiv, unit: 'div' },
    otherLoot: c(0),
    minutes: LOOP_DEFAULTS.minutes.value ?? Number.NaN,
    chaosPerDivine: rate,
  });
  assert.equal(LOOP_DEFAULTS.maps * LOOP_DEFAULTS.threadsPerMap, 24);
  assert.equal(r.cost, 274);
  assert.equal(r.net, 726);
  assert.ok(Math.abs(r.net / rate - 2.904) < 1e-9);
  assert.equal(formatMoney(r.perHour ?? 0, r.base, 'div', r.rate), '13.94 div');
  assert.equal(PRICES.featured.kind.value, 'sold');
});
