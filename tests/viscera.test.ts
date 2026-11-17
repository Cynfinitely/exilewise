import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cleanWikiText,
  parseVisceraWikitext,
  parseWikiTable,
  parseZones,
  statLines,
} from '../src/lib/poe1/viscera/wikiParse';
import {
  EMPTY_FILTER,
  groupFamilies,
  matches,
  toView,
} from '../src/lib/poe1/viscera/browse';
import { obtainable, suggest } from '../src/lib/poe1/viscera/suggest';
import { tagsFor } from '../src/lib/poe1/viscera/tags';
import {
  combineStats,
  formatStat,
  splitStat,
} from '../src/lib/poe1/viscera/totals';
import { parseWickerman } from '../src/lib/user/localStore';

// Trimmed copy of the wiki page layout, including its quirks: rowspans in
// several columns, two bosses for one item, a slot typo, multi-zone cells.
const PAGE = `
==List of regular viscera (Fate)==
{| class="wikitable sortable"
|+ List of regular viscera
|-
! Icon !! Slot !! Name !! Req.<br>Lv !! Description !! Boss !! Location
|-
| rowspan="3" | [[File:Scorched Arm inventory icon.png|100px]] || rowspan="3" | Upper Limb || Lesser Scorched Arm || 1 || (10-15)% chance to Ignite || rowspan="2" | [[Fire Fury]] || rowspan="2" | [[The Coast (Act 1)]]
|-
| Scorched Arm || 1 || (20-30)% chance to Ignite
|-
| Greater Scorched Arm || 1 || Ignites you inflict deal Damage (10-15)% Faster || [[Megaera]] || [[Crater]]
|-
| rowspan="4" | [[File:Galvanic Tentacle inventory icon.png|100px]] || rowspan="4" | Lowr Limb || Lesser Galvanic Tentacle || 1 || +(14-18)% to Lightning Resistance || rowspan="2" | [[Amarissa, Daughter of Merveil]] || rowspan="2" | [[The Cavern of Wrath]] (Act 1)
|-
| rowspan="2" | Galvanic Tentacle || rowspan="2" | 1 || rowspan="2" | +(22-28)% to Lightning Resistance
|-
| rowspan="2" | [[Shock and Horror]] || rowspan="2" | [[Mineral Pools]]
|-
| Greater Galvanic Tentacle || 1 || +(2-3)% to maximum Lightning Resistance
|-
| [[File:Golemic Stone inventory icon.png|100px]] || Torso || Golemic Stone || 12 || Minions deal (20-30)% increased Damage || [[Gneiss]]<br>[[Stoneshamble]] || [[The Old Fields]] (Act 2)<br>[[The Broken Bridge (Act 7)]]
|-
| [[File:Witch's Head inventory icon.png|100px]] || Head || Witch's Head || 1 || Increases and Reductions to Mana Regeneration Rate also apply to Energy<br>Shield Recharge Rate at (10-15)% of their value || [[Witch]] || [[Relic Chambers]] t7 NE
|}

==List of pinnacle viscera (Grim Fate)==
{| class="wikitable sortable"
|-
! Icon !! Slot !! Name !! Req.<br>Lv !! Description !! Boss !! Boss Key
|-
| rowspan="2" | [[File:Shaper's Head inventory icon.png|100px]] || rowspan="2" | Head || Shaper's Head || 1 || Gain [[Shaper's Presence]] for 10 seconds when you kill a Rare or Unique Enemy || [[The Shaper]]<br>[[Uber Elder]] || [[Shaper Fragment]]s<br>[[Uber Elder Fragment]]s
|-
| Greater Shaper's Head || 1 || Utility Flasks gain (1-2) Charges every 3 seconds || [[Uber Shaper]] || {{il|Cosmic Fragment}}
|}

==Coven Queen's Crown==
{| class="wikitable"
|-
! Icon !! Slot !! Name !! Description !! Boss !! Boss Key !! Flavour Text
|-
| [[File:Coven Queen's Crown inventory icon.png|100px]] || Head || Coven Queen's Crown || <2-3 random viscera modifiers> || [[The Coven Queen]] || {{il|page=Cursed Poppet}} || {{c|unique|''Sinew cleft from bone,<br>eyes alight.''}}
|}
`;

const parsed = parseVisceraWikitext(PAGE);
const byId = (id: string) => {
  const v = parsed.find(x => x.id === id);
  assert.ok(v, `missing ${id}`);
  return v;
};

test('parseWikiTable expands rowspans across columns', () => {
  const rows = parseWikiTable(`{|
|-
| rowspan="2" | A || B || rowspan="2" | C
|-
| D
|}`);
  assert.deepEqual(rows, [
    ['A', 'B', 'C'],
    ['A', 'D', 'C'],
  ]);
});

test('cleanWikiText strips links, templates and breaks', () => {
  assert.equal(
    cleanWikiText('[[Shaper Fragment]]s<br>{{il|page=Cursed Poppet}}'),
    'Shaper Fragments\nCursed Poppet'
  );
  assert.equal(cleanWikiText('[[Target|Shown]] text'), 'Shown text');
});

test('statLines re-joins a stat wrapped mid-phrase', () => {
  assert.deepEqual(statLines('apply to Energy<br>Shield Recharge'), [
    'apply to Energy Shield Recharge',
  ]);
  assert.deepEqual(statLines('+1 to A<br>+1 to B'), ['+1 to A', '+1 to B']);
});

test('parseZones reads acts inside and after links and drops editor notes', () => {
  assert.deepEqual(
    parseZones('[[The Old Fields]] (Act 2)<br>[[The Broken Bridge (Act 7)]]'),
    [
      { zone: 'The Old Fields', act: 2 },
      { zone: 'The Broken Bridge', act: 7 },
    ]
  );
  assert.deepEqual(parseZones('[[Relic Chambers]] t7 NE'), [
    { zone: 'Relic Chambers', act: null },
  ]);
});

test('parseVisceraWikitext reads every table with tiers and slots', () => {
  assert.equal(byId('lesser-scorched-arm').tier, 'lesser');
  assert.equal(byId('scorched-arm').sources[0].where, 'The Coast');
  assert.equal(byId('scorched-arm').sources[0].act, 1);
  assert.equal(byId('greater-scorched-arm').sources[0].kind, 'map');
  assert.equal(byId('galvanic-tentacle').slot, 'Lower Limb'); // "Lowr Limb" typo
  assert.equal(byId('golemic-stone').levelReq, 12);
  assert.equal(byId('shapers-head').tier, 'pinnacle');
  assert.equal(byId('greater-shapers-head').tier, 'uber');
  assert.equal(byId('coven-queens-crown').tier, 'queen');
  assert.match(
    byId('coven-queens-crown').flavour ?? '',
    /Sinew cleft from bone, eyes alight/
  );
  assert.equal(byId('scorched-arm').icon, 'Scorched Arm inventory icon.png');
});

test('an item dropped by two bosses becomes one entry with both sources', () => {
  const v = byId('galvanic-tentacle');
  assert.deepEqual(
    v.sources.map(s => s.boss),
    ['Amarissa, Daughter of Merveil', 'Shock and Horror']
  );
  assert.equal(parsed.filter(x => x.id === 'galvanic-tentacle').length, 1);
});

test('paired boss and zone lists stay paired', () => {
  assert.deepEqual(
    byId('golemic-stone').sources.map(s => `${s.boss}@${s.where}:${s.act}`),
    ['Gneiss@The Old Fields:2', 'Stoneshamble@The Broken Bridge:7']
  );
});

test('tagsFor infers build tags from stat text', () => {
  assert.deepEqual(tagsFor({ effects: ['(20-30)% chance to Ignite'] }), [
    'fire',
    'dot',
  ]);
  assert.ok(
    tagsFor({ effects: ['Minions deal (20-30)% increased Damage'] }).includes(
      'minion'
    )
  );
  assert.ok(
    tagsFor({ effects: ['+(22-28)% to Lightning Resistance'] }).includes(
      'resist'
    )
  );
});

test('matches filters by search, slot, source and act', () => {
  const views = parsed.map(toView);
  const find = (patch: Partial<typeof EMPTY_FILTER>) =>
    views.filter(v => matches(v, { ...EMPTY_FILTER, ...patch })).map(v => v.id);
  assert.deepEqual(find({ q: 'megaera' }), ['greater-scorched-arm']);
  assert.ok(
    find({ slots: ['Lower Limb'] }).every(id => id.includes('galvanic'))
  );
  assert.deepEqual(find({ sources: ['queen'] }), ['coven-queens-crown']);
  assert.ok(!find({ maxAct: 1 }).includes('golemic-stone'));
  assert.ok(find({ maxAct: 2 }).includes('golemic-stone'));
});

test('groupFamilies keeps tiers in order inside a family', () => {
  const fams = groupFamilies(parsed.map(toView), 'name');
  const arm = fams.find(f => f.family === 'Scorched Arm');
  assert.deepEqual(
    arm?.members.map(m => m.tier),
    ['lesser', 'normal', 'greater']
  );
});

test('suggest skips off-build viscera and respects progress', () => {
  const views = parsed.map(toView);
  const fire = suggest(views, {
    tags: ['fire', 'dot'],
    progress: 'maps',
    act: 10,
  });
  assert.equal(fire['Upper Limb'][0]?.viscera.id, 'greater-scorched-arm');
  assert.equal(fire['Lower Limb'].length, 0); // lightning resistance only: no match

  const campaign = suggest(views, {
    tags: ['fire'],
    progress: 'campaign',
    act: 10,
  });
  assert.notEqual(
    campaign['Upper Limb'][0]?.viscera.id,
    'greater-scorched-arm'
  ); // map drop

  // A minion stat is no use to a spell build: style conflict, not suggested.
  const spell = suggest(views, {
    tags: ['spell', 'minion'],
    progress: 'maps',
    act: 10,
  });
  assert.equal(spell.Torso[0]?.viscera.id, 'golemic-stone');
  const selfCast = suggest(views, {
    tags: ['spell'],
    progress: 'maps',
    act: 10,
  });
  assert.equal(selfCast.Torso.length, 0);

  const crown = views.find(v => v.tier === 'queen')!;
  assert.equal(
    obtainable(crown, { tags: [], progress: 'uber', act: 10 }),
    false
  );
});

test('parseWickerman keeps only valid slot ids', () => {
  assert.deepEqual(
    parseWickerman('{"Head":"witchs-head","Torso":"BAD ID","Tail":"x"}'),
    { Head: 'witchs-head' }
  );
  assert.deepEqual(parseWickerman('not json'), {});
  assert.deepEqual(parseWickerman(null), {});
});

test('combineStats merges matching lines and sums their ranges', () => {
  const totals = combineStats({
    Head: { effects: ['(10-15)% increased Area of Effect'] },
    Torso: {
      effects: ['(5-8)% increased Area of Effect', '+(35-50) to maximum Life'],
    },
    'Upper Limb': {
      effects: ['Adds (2-4) to (5-7) Physical Damage to Attacks'],
    },
  });
  const aoe = totals.find(t => t.template === '#% increased Area of Effect');
  assert.deepEqual(aoe?.values, [[15, 23]]);
  assert.deepEqual(aoe?.slots, ['Head', 'Torso']);
  assert.equal(formatStat(aoe!, 'range'), '(15-23)% increased Area of Effect');
  assert.equal(formatStat(aoe!, 'max'), '23% increased Area of Effect');
  assert.equal(totals.find(t => t.template.includes('Life'))?.group, 'defence');
  const adds = totals.find(t => t.template.startsWith('Adds'));
  assert.equal(adds?.group, 'offence');
  assert.equal(
    formatStat(adds!, 'min'),
    'Adds 2 to 5 Physical Damage to Attacks'
  );
});

test('combineStats groups minion recovery as defence, minion damage as offence', () => {
  const totals = combineStats({
    Torso: {
      effects: ['Minions Recover (3-5)% of Life on Killing a Poisoned Enemy'],
    },
    Head: { effects: ['Minions deal (20-30)% increased Damage'] },
  });
  assert.equal(
    totals.find(t => t.template.startsWith('Minions Recover'))?.group,
    'defence'
  );
  assert.equal(
    totals.find(t => t.template.startsWith('Minions deal'))?.group,
    'offence'
  );
});

test('combineStats compounds "more" multipliers', () => {
  const [t] = combineStats({
    Head: { effects: ['10% more Damage'] },
    Torso: { effects: ['10% more Damage'] },
  });
  assert.deepEqual(t.values, [[21, 21]]);
});

test('splitStat keeps fixed numbers and decimals', () => {
  assert.deepEqual(splitStat('Regenerate (1.6-2)% of Life per second'), {
    template: 'Regenerate #% of Life per second',
    values: [[1.6, 2]],
  });
  assert.deepEqual(
    splitStat('Trigger Level 20 Summon Void Spawn every 4 seconds').values,
    [
      [20, 20],
      [4, 4],
    ]
  );
});
