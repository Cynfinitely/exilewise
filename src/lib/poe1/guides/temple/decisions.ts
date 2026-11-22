import { fill, type Fill } from '../fill';

/**
 * Architect and door decisions: worked examples, the key rooms of the farm
 * and troubleshooting. Examples use the author's own pre-Incursion
 * screenshots (public/poe1/guides/temple-of-atzoatl/). An example without a
 * screenshot can carry an original `diagram` instead.
 */

export type RoomKind = 'entrance' | 'target' | 'room' | 'apex';

export interface RoomNode {
  id: string;
  label: string;
  tier?: 1 | 2 | 3;
  kind: RoomKind;
  /** Grid position: column 0–4 left to right, row 0 (top) to 3 (bottom). */
  col: number;
  row: number;
}

export interface Door {
  from: string;
  to: string;
  open: boolean;
  /** The door this example tells you to open. */
  action?: boolean;
}

export interface Screenshot {
  /** Path under /public, e.g. '/poe1/guides/temple-of-atzoatl/example-1.png'. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface WorkedExample {
  id: string;
  title: string;
  situation: string;
  /** The headline answers, shown as the two largest labels. */
  architect: { answer: string; detail: string };
  door: { answer: string; detail: string };
  steps: string[];
  screenshot: Fill<Screenshot>;
  /** Original illustrative layout, used when there is no screenshot. */
  diagram?: { rooms: RoomNode[]; doors: Door[]; summary: string };
  /** Details from the author's own run that are still missing. */
  open: Fill<string>[];
}

export const EXAMPLES: WorkedExample[] = [
  {
    id: 'lightning-workshop-to-cradle',
    title: 'Example 1: turn Lightning Workshop into Cradle of Creation',
    situation:
      'Alva’s preview for a tier 1 Lightning Workshop, with 8 Incursions remaining. Xopec, Architect of Power, built the room. Xipocado, Architect to the Queen, is the visitor, as the 3.30 notes say for Alluring Incursions on a Royal Visage map. The preview lists what killing each Architect does: Xopec, “Kill to change to Cradle of Creation”; Xipocado, “Kill to upgrade to Grand Reactor”.',
    architect: {
      answer: 'Kill Xopec, Architect of Power. Keep Xipocado alive.',
      detail:
        'Killing Xopec leaves Xipocado to shape the room, and Xipocado turns it into Cradle of Creation. Killing Xipocado instead would only upgrade Lightning Workshop to Grand Reactor. In this run the room ended up as Cradle of Creation (tier 3).',
    },
    door: {
      answer: 'No door choice in this example',
      detail:
        'This one is about the Architect. The preview shows Lightning Workshop with two passages open (green) and one closed (red). The screenshot does not record a door being opened.',
    },
    steps: [
      'Open Lightning Workshop in Alva’s Temple view before entering.',
      'Read each Architect’s line: Xopec’s says “Kill to change to Cradle of Creation”.',
      'In the Incursion, kill Xopec and leave Xipocado alive.',
      'Back in the Temple view, check that the room now shows Cradle of Creation.',
    ],
    screenshot: fill<Screenshot>(
      'Annotated screenshot for example 1 (Cradle upgrade)',
      {
        src: '/poe1/guides/temple-of-atzoatl/lightning-workshop-to-cradle.png',
        alt: 'Alva’s Lightning Workshop preview shows Xopec as the architect to kill to change the room into Cradle of Creation, with two passages open and one closed.',
        width: 1333,
        height: 841,
      }
    ),
    open: [],
  },
  {
    id: 'corruption-chamber-upgrade',
    title: 'Example 2: upgrade Corruption Chamber',
    situation:
      'Alva’s preview for a tier 1 Corruption Chamber, with 1 Incursion remaining. Paquate, Architect of Corruption, built the room. Opiloti, Architect of Strife, is the visitor. Opiloti’s line reads “Kill to upgrade to Catalyst of Corruption”; Paquate’s reads “Kill to change to Hall of Mettle”. The rest of the layout already shows Cradle of Creation, Apex of Ascension, Storm of Corruption and Shrine of Unmaking at tier 3.',
    architect: {
      answer:
        'Kill Opiloti, Architect of Strife. Keep Paquate, Architect of Corruption, alive.',
      detail:
        'Paquate built the room, so with Paquate surviving it goes up a tier, to Catalyst of Corruption according to the preview. Killing Paquate would turn it into Hall of Mettle. In 3.30 the Corruption rooms also add Rarity and Pack Size to the Temple.',
    },
    door: {
      answer: 'No door choice in this example',
      detail:
        'This one is about the Architect. The preview shows Corruption Chamber with three passages open (green) and one closed (red). The screenshot does not record a door being opened.',
    },
    steps: [
      'Open Corruption Chamber in Alva’s Temple view before entering.',
      'Read each Architect’s line: Opiloti’s says “Kill to upgrade to Catalyst of Corruption”.',
      'In the Incursion, kill Opiloti and leave Paquate alive.',
      'The preview names Catalyst of Corruption (tier 2) as the result. Check the final tier in the Temple view or on the Chronicle.',
    ],
    screenshot: fill<Screenshot>(
      'Annotated screenshot for example 2 (Corruption Chamber upgrade)',
      {
        src: '/poe1/guides/temple-of-atzoatl/corruption-chamber-upgrade.png',
        alt: 'Alva’s Tier 1 Corruption Chamber preview shows Opiloti as the architect to kill to upgrade the room to Catalyst of Corruption, with three passages open and one closed.',
        width: 1381,
        height: 835,
      }
    ),
    open: [],
  },
];

export interface RoomNote {
  name: string;
  chain: string;
  why: string;
  /** Source label, or a note that it is long-standing behaviour. */
  basis: string;
}

export const KEY_ROOMS: RoomNote[] = [
  {
    name: 'Cradle of Creation',
    chain: 'Tiers 1–3 (formerly Throne of Atziri)',
    why: 'The Temple becomes area level 84 and contains Uber Atziri. All Temple modifiers have more effect, monsters have more difficulty and reward, and the uniques that used to need Vials drop in Cradle Temples. This is the room the farm is built around.',
    basis: '3.30.0 patch notes',
  },
  {
    name: 'Locus of Corruption',
    chain: 'Corruption Chamber → Catalyst of Corruption → Locus of Corruption',
    why: 'Its altar can corrupt an item a second time (double corruption is still in 3.30: a hotfix fixed double-corrupted Imbued Gems). In 3.30 all three Corruption rooms also add Rarity and Pack Size to the Temple.',
    basis: '3.30.0 patch notes, 3.30.0b hotfix',
  },
  {
    name: 'Doryani’s Institute',
    chain:
      'Gemcutter’s Workshop → Department of Thaumaturgy → Doryani’s Institute',
    why: 'Its Lapidary Lens corrupts gems, which gem buyers look for. A strong second room to advertise next to Cradle.',
    basis: 'Long-standing behaviour, not re-checked for 3.30',
  },
  {
    name: 'Apex of Atzoatl',
    chain: 'Always present',
    why: 'The Temple’s final room. The trade site filters it as open or closed, so buyers can see whether it is reachable.',
    basis: 'Official trade site room filters',
  },
];

/** When Apex access matters for the layout you are selling. */
export const APEX_NOTE =
  'Cradle of Creation’s value comes from the Temple encounter itself: Uber Atziri at area level 84. A buyer paying for that expects to reach the end of the Temple, so check that Apex of Atzoatl shows as open on the Chronicle and say so in your listing. For a Locus or Doryani’s Temple, buyers mostly need that room to be open. Apex matters less there.';

export interface Trouble {
  problem: string;
  answer: string[];
}

export const TROUBLESHOOTING: Trouble[] = [
  {
    problem: 'A valuable room is disconnected',
    answer: [
      'Work backwards from the room to the Entrance and find the first closed door on the shortest path. That is the only door worth a Stone.',
      'Doors open from inside an Incursion, so you need an Incursion in that room or one next to it on the path. If none is left this loop, list the room as closed: the trade filters show it either way.',
    ],
  },
  {
    problem: 'The room rolls are weak',
    answer: [
      'Rooms change when the wrong Architect survives. Before each fight, decide which room you are protecting and which you are happy to lose.',
      'If Cradle never appears, sell what you built, usually Locus or Doryani’s, and compare against listings for that layout rather than Cradle Temples.',
    ],
  },
  {
    problem: 'The preferred upgrade cannot be completed',
    answer: [
      'Sell as is: list the real tiers and price against Temples with the same Cradle tier, not the one you hoped for.',
      'Run it yourself: worth it only if you can kill Uber Atziri and value the drops (Royal Visage, Soul Cores at level 80+).',
      'Note: since 3.30.0d an Incursion Thread modifier can add a room full of Architects that drops an itemised Temple with randomised room tiers. That is a separate, random Temple, not a way to finish yours.',
    ],
  },
  {
    problem: 'My Stones of Passage turned into Gold',
    answer: [
      'That is the Passage of Time notable: Stones left on the ground turn into Gold when the Incursion ends. Pick them up and use them during the Incursion, or drop the notable.',
    ],
  },
];
