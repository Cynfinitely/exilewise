import { fill, type Fill } from '../fill';

/**
 * Guide text for the quick start, setup checklist and three-map loop. Plain
 * data so it can be edited without touching components. Claims here are
 * either from the sources in meta.ts, from the author's own run (screenshots
 * in public/poe1/guides/temple-of-atzoatl/), or marked:
 *  - `fill(...)`: an exact setup detail only the author can confirm;
 *  - `check`: long-standing game behaviour not re-verified for 3.30.
 */

/** Which map in the loop gets the Royal Visage (1, 2 or 3). */
export const ROYAL_VISAGE_MAP: Fill<1 | 2 | 3> = fill<1 | 2 | 3>(
  'Which map (1, 2 or 3) gets the Royal Visage',
  2
);

export const QUICK_START = {
  produces:
    'An itemised Temple of Atzoatl built around Cradle of Creation, sold to other players, plus the loot from three heavily juiced Incursion maps. Cradle of Creation makes the Temple area level 84 with Uber Atziri and gives every Temple modifier more effect (3.30.0).',
  suits: [
    'You can clear tier 16 maps with eight Threads applied. At 8 Threads every map rolls at least three random Thread modifiers and Incursions bring more Rare monsters (3.30.0c).',
    'You are happy to sell on the trade site rather than run Uber Atziri yourself.',
    'You want a loop you can repeat: three maps in, one Temple out.',
  ],
  prepare: [
    'The Atlas tree with the Incursion notables (link at the top of the page).',
    'Three tier 16 maps.',
    'Eight Incursion Threads per map, so 24 for the loop.',
    'One Royal Visage, used on Map 2.',
  ],
};

export interface LoopStep {
  map: 1 | 2 | 3;
  /** One-line summary for the at-a-glance strip. */
  glance: string;
  prepare: string[];
  alva: string[];
  beforeLeaving: string[];
  ifMissing: string[];
}

export const LOOP: LoopStep[] = [
  {
    map: 1,
    glance: 'Start the Temple and build rooms for Map 2.',
    prepare: [
      'Tier 16 map with eight Incursion Threads in the Map Device. At 8 Incursion Threads your Incursions get 40% increased pack size (3.30.0c).',
      'No Royal Visage yet: it goes on Map 2.',
    ],
    alva: [
      'Before each Incursion, open the room in Alva’s Temple view. The preview names both Architects and what killing each one does, e.g. “Kill to upgrade to …” or “Kill to change to …”.',
      'Kill the Architect whose line names the result you want. The other one survives and shapes the room.',
      'Upgrade rooms that add value and keep tier 3 rooms you already have.',
    ],
    beforeLeaving: [
      'Check the Temple view: the counter at the bottom shows how many Incursions remain.',
      'Count unused Stones of Passage. Use them before the Incursion ends if you have Passage of Time allocated, since it turns Stones left on the ground into Gold.',
    ],
    ifMissing: [
      'Map 1 has no target room yet. Use it to upgrade useful rooms and open passages toward the Entrance so Map 2 has something to build on.',
    ],
  },
  {
    map: 2,
    glance: 'Use the Royal Visage and bring Cradle of Creation in.',
    prepare: [
      'Use the Royal Visage on the tier 16 map before you open it, then add eight Incursion Threads.',
      'The Visage makes this map’s Incursions Alluring: more difficulty and reward (3.30.0).',
    ],
    alva: [
      'On this map the visiting Architect is always Xipocado, Architect to the Queen, until Xipocado lives in the Temple (3.30.0).',
      'Pick a room where the preview reads “Kill [other Architect] to change to Cradle of Creation”. Kill that Architect and keep Xipocado alive (example 1 below).',
      'Once Cradle is in, an Incursion in Cradle has Xipocado as the resident: keep Xipocado alive to upgrade it.',
    ],
    beforeLeaving: [
      'Find Cradle in the Temple view and check its tier.',
      'Trace a path from the Entrance to Cradle through open passages only. Note the first closed one, if any.',
    ],
    ifMissing: [
      'Cradle did not appear: switch to the best room you have (Locus of Corruption, Doryani’s Institute) and sell that layout instead.',
    ],
  },
  {
    map: 3,
    glance: 'Finish the upgrades and itemise with Alva.',
    prepare: ['Tier 16 map with the same eight Incursion Threads.'],
    alva: [
      'Spend the last Incursions on the upgrades that add the most value: protect Cradle first, then upgrade rooms like Corruption Chamber (example 2 below).',
      'When Alva has found the Temple, choose to itemise it instead of running it. She gives you a Chronicle of Atzoatl.',
    ],
    beforeLeaving: [
      'Hover the Chronicle: check Cradle’s tier, which rooms are open or closed and whether Apex of Atzoatl is reachable.',
      'Screenshot it for the listing and your price log.',
    ],
    ifMissing: [
      'Upgrade not finished: sell the Temple as it is at a lower price, or run it yourself. See the troubleshooting section for the trade-off.',
    ],
  },
];

export type Need = 'required' | 'optional';

export interface ChecklistItem {
  name: string;
  need: Need;
  why: string;
  /** Exact details from the author's setup, shown as To fill markers until set. */
  details?: Fill<string>[];
}

export const CHECKLIST: ChecklistItem[] = [
  {
    name: 'Atlas tree with the Incursion cluster',
    need: 'required',
    why: 'The Incursion Atlas cluster was reworked in 3.30. Its notables set how many Incursions each map has and how tough and rewarding the Architects are.',
    details: [
      fill(
        'Exact Incursion notables allocated in your tree',
        'Artefacts of the Vaal, Power Struggle, Time Dilation, Military Reserves and Soldiers of Yore (142-point tree).'
      ),
    ],
  },
  {
    name: 'Eight Incursion Threads per map',
    need: 'required',
    why: 'Threads replaced Scarabs in 3.30 and eight is the cap. At 8 Incursion Threads you get 40% increased Incursion pack size, at least three random Thread modifiers and more Rare monsters.',
    details: [
      fill(
        'Thread mix per map (all Incursion, or which other types)',
        'All eight are Incursion Threads, 24 in total. No other Thread types.'
      ),
    ],
  },
  {
    name: 'Three tier 16 maps',
    need: 'required',
    why: 'Royal Visage can only be used on a tier 16 non-unique map. In this loop the other two maps are tier 16 as well.',
    details: [
      fill('Map tier for the loop', 'All three maps are tier 16.'),
      fill('Map modifiers you run'),
    ],
  },
  {
    name: 'One Royal Visage, on Map 2',
    need: 'required',
    why: 'It makes the map’s Incursions Alluring (more difficulty and reward) and forces Xipocado, Architect to the Queen, as the visiting Architect. That is how Cradle of Creation gets into the Temple. Royal Visage drops from Atziri in level 81+ Temples.',
  },
  {
    name: 'Artefacts of the Vaal (Atlas notable)',
    need: 'required',
    why: '“Your Maps with Incursions always have four Incursions.” Four per map is what makes three maps enough for one Temple.',
    details: [
      fill('Whether Artefacts of the Vaal is in your tree', 'Allocated.'),
    ],
  },
  {
    name: 'Passage of Time (Atlas notable)',
    need: 'optional',
    why: 'Using a Stone of Passage empowers the Incursion’s monsters with Doryani’s Safeguards, and Stones left on the ground turn into Gold when the Incursion ends. Only take it if you always spend your Stones.',
    details: [fill('Whether Passage of Time is in your tree', 'Not taken.')],
  },
  {
    name: 'Other consumables',
    need: 'optional',
    why: 'Anything else you add to the map device or the maps. Enter the cost in the calculator so profit stays honest.',
    details: [
      fill(
        'Other consumables you use per map',
        'None besides the Threads and the Royal Visage.'
      ),
    ],
  },
];

/**
 * Incursion notables. `effect` is verified text (poedb tree data); null
 * means the author takes it but the effect text was not re-checked here.
 */
export const NOTABLES: {
  name: string;
  effect: string | null;
  inMyTree: boolean;
}[] = [
  {
    name: 'Artefacts of the Vaal',
    effect: 'Your Maps with Incursions always have four Incursions.',
    inMyTree: true,
  },
  { name: 'Power Struggle', effect: null, inMyTree: true },
  { name: 'Time Dilation', effect: null, inMyTree: true },
  {
    name: 'Military Reserves',
    effect: '33% chance for all Incursion monsters to be at least Magic.',
    inMyTree: true,
  },
  {
    name: 'Soldiers of Yore',
    effect:
      'Incursion portals spawn packs of invading Incursion monsters when you leave.',
    inMyTree: true,
  },
  {
    name: 'Passage of Time',
    effect:
      'Using a Stone of Passage empowers the Incursion’s monsters with Doryani’s Safeguards. Stones of Passage on the ground turn into Gold when Incursions end.',
    inMyTree: false,
  },
  {
    name: 'Architects of Demise',
    effect:
      'Architects have 100% increased Toughness, are Possessed by a Tormented Spirit and gain a monster modifier for each Incursion completed in the area.',
    inMyTree: false,
  },
];

/** Flow notes, backed by the author's screenshots from this loop. */
export const FLOW_CHECKS = {
  templeOpens:
    'Alva’s Temple view counts down the Incursions left until the Temple. With four Incursions per map, three maps cover it: the example screenshots show 8 remaining in example 1 and 1 remaining in example 2. If your Incursions per map differ, watch that counter.',
  alvaPreview:
    'Seen in the screenshots below: the preview names the room, both Architects and what killing each one does. Passages show as green (open) or red (closed) markers.',
};
