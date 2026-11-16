import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CraftPlan } from '../src/lib/craft/types';
import {
  deletePlan,
  FAVORITES_KEY,
  PLANS_KEY,
  readFavorites,
  readPlans,
  savePlan,
  toggleFavorite,
  type KeyValueStorage,
} from '../src/lib/user/localStore';
import { REPRICE_LIMIT, repriceSchema } from '../src/lib/user/repriceRequest';

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

const throwingStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

const plan = {
  baseId: 'Metadata/Items/Test',
  baseName: 'Test Base',
  itemLevel: 82,
  desiredPrefixes: [],
  desiredSuffixes: [],
  methods: [],
} as unknown as CraftPlan;

test('savePlan stores plans newest first and deletePlan removes one', () => {
  const s = memoryStorage();
  const a = savePlan(s, 'first', plan, 1);
  const b = savePlan(s, 'second', plan, 2);
  assert.ok(a && b);
  assert.notEqual(a.id, b.id);
  assert.deepEqual(
    readPlans(s).map(p => p.name),
    ['second', 'first']
  );
  assert.equal(readPlans(s)[0].baseId, 'Metadata/Items/Test');

  assert.equal(deletePlan(s, a.id), true);
  assert.deepEqual(
    readPlans(s).map(p => p.name),
    ['second']
  );
});

test('corrupt or malformed stored data reads as empty or is filtered', () => {
  const s = memoryStorage();
  s.data.set(PLANS_KEY, '{not json');
  assert.deepEqual(readPlans(s), []);

  s.data.set(PLANS_KEY, JSON.stringify({ not: 'a list' }));
  assert.deepEqual(readPlans(s), []);

  s.data.set(
    PLANS_KEY,
    JSON.stringify([
      { id: 'ok', name: 'good', baseId: null, createdAt: 1, plan },
      { id: 'bad', name: 'no plan', baseId: null, createdAt: 2 },
      'junk',
    ])
  );
  assert.deepEqual(
    readPlans(s).map(p => p.id),
    ['ok']
  );
});

test('toggleFavorite adds then removes a base', () => {
  const s = memoryStorage();
  const base = { baseId: 'b1', name: 'Base One', itemClass: 'Ring' };
  assert.equal(toggleFavorite(s, base, 5), true);
  assert.deepEqual(readFavorites(s), [{ ...base, createdAt: 5 }]);
  assert.equal(toggleFavorite(s, base), false);
  assert.deepEqual(readFavorites(s), []);
  assert.ok(s.data.has(FAVORITES_KEY));
});

test('blocked storage reads as empty and reports failed writes', () => {
  assert.deepEqual(readPlans(throwingStorage), []);
  assert.deepEqual(readFavorites(null), []);
  assert.equal(savePlan(throwingStorage, 'x', plan), null);
  assert.equal(savePlan(null, 'x', plan), null);
  assert.equal(
    toggleFavorite(throwingStorage, { baseId: 'b', name: 'B', itemClass: '' }),
    null
  );
  assert.equal(deletePlan(null, 'x'), false);
});

test('repriceSchema accepts plans and rejects bad or oversized bodies', () => {
  assert.ok(repriceSchema.safeParse({ plans: [{ id: 'a', plan }] }).success);
  assert.equal(repriceSchema.safeParse({}).success, false);
  assert.equal(
    repriceSchema.safeParse({ plans: [{ id: 'a', plan: { methods: 'x' } }] })
      .success,
    false
  );
  assert.equal(
    repriceSchema.safeParse({
      plans: Array.from({ length: REPRICE_LIMIT + 1 }, (_, i) => ({
        id: String(i),
        plan,
      })),
    }).success,
    false
  );
});
