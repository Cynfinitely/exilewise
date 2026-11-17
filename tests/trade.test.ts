import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  INSTANT_BUYOUT,
  resolveTrade,
  tradeLeague,
  tradeUrl,
  type StatIndex,
} from '../src/lib/poe1/viscera/trade';

const types = new Set(['Scorched Arm', "Crustacean's Claw"]);
const stats: StatIndex = new Map([
  ['#% chance to Ignite', ['explicit.stat_1', 'implicit.stat_1']],
  ['Adds # to # Physical Damage to Attacks', ['explicit.stat_2']],
]);

test('resolveTrade pins a tier by its lowest roll', () => {
  assert.deepEqual(
    resolveTrade(
      {
        name: 'Scorched Arm',
        family: 'Scorched Arm',
        effects: ['(20-30)% chance to Ignite'],
      },
      types,
      stats
    ),
    {
      type: 'Scorched Arm',
      statIds: ['explicit.stat_1', 'implicit.stat_1'],
      min: 20,
    }
  );
});

test('resolveTrade averages "Adds # to #" and falls back to type only', () => {
  const adds = resolveTrade(
    {
      name: "Crustacean's Claw",
      family: "Crustacean's Claw",
      effects: ['Adds (8-12) to (15-18) Physical Damage to Attacks'],
    },
    types,
    stats
  );
  assert.equal(adds?.min, 11.5);
  const unknownStat = resolveTrade(
    {
      name: 'Greater Scorched Arm',
      family: 'Scorched Arm',
      effects: ['Something new'],
    },
    types,
    stats
  );
  assert.deepEqual(unknownStat, {
    type: 'Scorched Arm',
    statIds: [],
    min: null,
  });
  assert.equal(
    resolveTrade(
      { name: 'X', family: 'Not On Trade', effects: [] },
      types,
      stats
    ),
    null
  );
});

test('tradeUrl opens an Instant Buyout search, cheapest first', () => {
  const url = new URL(
    tradeUrl(
      { type: 'Scorched Arm', statIds: ['explicit.stat_1'], min: 20 },
      'Hardcore Covens'
    )
  );
  assert.equal(url.origin, 'https://www.pathofexile.com');
  assert.equal(url.pathname, '/trade/search/Hardcore%20Covens');
  const q = JSON.parse(url.searchParams.get('q')!);
  assert.equal(q.query.status.option, INSTANT_BUYOUT);
  assert.equal(q.query.type, 'Scorched Arm');
  assert.deepEqual(q.query.stats[0].filters, [
    { id: 'explicit.stat_1', value: { min: 20 } },
  ]);
  assert.deepEqual(q.sort, { price: 'asc' });
});

test('tradeLeague keeps Covens leagues and maps others to Covens', () => {
  assert.equal(tradeLeague('Hardcore Covens'), 'Hardcore Covens');
  assert.equal(tradeLeague('Standard'), 'Covens');
});
