import { fill, type Fill } from '../fill';

/**
 * Temple of Atzoatl farm guide: everything dated or likely to change lives
 * here (patch, prices, links). Update this file, not the components.
 * Unconfirmed details are `fill(...)` fields: the page marks them "To fill"
 * until a value is set.
 */

export const GUIDE_PATH = '/poe1/guides/temple-of-atzoatl-farm';

export const GUIDE = {
  /** Date the guide content was last checked. Feeds the sitemap and JSON-LD. */
  updatedAt: '2026-11-22',
  /** Patch the mechanics were verified against. */
  patch: '3.30.0d',
  league: 'Covens',
  /** 11-character YouTube id of the companion video, e.g. 'SCJX7QejlfQ'. */
  videoId: fill('YouTube video id of the Temple farm video'),
  /** Title shown on the play button until the video is set. */
  videoTitle: 'Covens 3.30: full 8-Thread, three-map Temple of Atzoatl farm',
  /** Shareable Atlas passive tree link (poeplanner / official tree export). */
  atlasTreeUrl: fill(
    'Atlas passive tree URL',
    'https://www.pathofexile.com/fullscreen-atlas-skill-tree/league/AAAABgAAjgB5AjUGWgeICBQKGQqECugLCg3cDtMQ4RMXFxQXURguG04eWx5vH2EfZh_2IcUltibnKNAqAS6LMDUxazhvOY496z5zP6pBX0OpRFRILEiZSLBKDkwhUBdRgleLWn1azlvyW_Nc2V23Xipe91_rYCFgZ2B7ZWtmtWfpaEBp1WzBbf1uPHDJcQtyL3VDdVx2q3cfeVp5w3sKfHR9E30dfZ2BdIPdhEyFxIgiiIKLGI3zjvKPHZF9kgGSLJJOmdSdh52xoF2htaLep4Krf69FtIa1fbX9txG3h7pMuu--Z8bQxtvMWc6RzsPS_NNe1DXUh9ie2mTaveGL43DjeOTM5yjpLupV6o3uwe-u8QXyk_K290_5APqy-t79yf7eAAJ_HpJOwixb8g=='
  ),
  /** Points spent in the linked Atlas tree. */
  atlasTreePoints: 142,
} as const;

export type PriceKind = 'asking' | 'sold' | 'unsold';

export interface PricePoint {
  /** ISO date the price was seen. */
  date: string;
  /** Layout summary as it would read in a listing. */
  layout: string;
  amountDiv: number;
  /** Gross: before any input costs. */
  gross: true;
  /** Asking price, completed sale or still unsold. Unknown until filled. */
  kind: Fill<PriceKind>;
  note?: string;
}

/**
 * Dated price assumptions. The first entry is the featured example used as
 * the calculator's default sale.
 */
export const PRICES: { featured: PricePoint; log: PricePoint[] } = {
  featured: {
    date: '2026-11-22',
    layout: 'Cradle of Creation Temple (featured layout from the video)',
    amountDiv: 4,
    gross: true,
    kind: fill<PriceKind>(
      'Featured 4 div price: asking, completed sale or unsold',
      'sold'
    ),
    note: 'Sold for 4 Divine Orbs gross. One sale on one date, not a guarantee: other Temples sell for more or less.',
  },
  /** Add more rows as you list and sell Temples. */
  log: [],
};

/** Chaos per divine on the featured price's date, prefilled in the calculator. */
export const CHAOS_PER_DIVINE: Fill<number> = fill<number>(
  'Chaos-per-Divine exchange rate on the price date',
  250
);

/** Calculator defaults for one loop: approximate costs from the featured run. */
export const LOOP_DEFAULTS = {
  maps: 3,
  threadsPerMap: 8,
  mapCostChaos: fill<number>('Cost of one map (chaos)', 0),
  threadCostChaos: fill<number>('Cost of one Incursion Thread (chaos)', 1),
  royalVisageChaos: fill<number>('Royal Visage market price (chaos)', 250),
  otherCostsChaos: fill<number>('Other consumables per loop (chaos)', 0),
  minutes: fill<number>(
    'Typical minutes for the three maps plus the Temple',
    12.5
  ),
  /** Observed range for the loop, including itemising and listing. */
  minutesObserved: '10–15',
};

export interface Source {
  label: string;
  url: string;
  /** What the guide uses it for. */
  covers: string;
  official: boolean;
}

/** Date every source below was read. */
export const SOURCES_ACCESSED = '2026-11-22';

export const SOURCES: Source[] = [
  {
    label: 'Path of Exile 3.30.0 Content Update patch notes',
    url: 'https://www.pathofexile.com/forum/view-thread/4013680',
    covers:
      'Threads replacing Scarabs, the 8-Thread cap, Royal Visage, Alluring Incursions, Xipocado, Cradle of Creation, room renames and the Corruption-room rarity change',
    official: true,
  },
  {
    label: 'Path of Exile 3.30.0c patch notes',
    url: 'https://www.pathofexile.com/forum/view-thread/4017172',
    covers:
      'Incursion pack size at 3/6/8 Threads, guaranteed Thread modifiers, more Rare monsters with more Threads',
    official: true,
  },
  {
    label: 'Path of Exile 3.30.0d patch notes',
    url: 'https://www.pathofexile.com/forum/view-thread/4017726',
    covers:
      'The "one room contains only Architects" Thread modifier that drops an itemised Temple',
    official: true,
  },
  {
    label: 'Path of Exile 3.30.0b Hotfix 3',
    url: 'https://www.pathofexile.com/forum/view-thread/4015683',
    covers: 'Dangerous Thread modifiers restricted on low-level maps',
    official: true,
  },
  {
    label: 'Official trade site stat data (temple room filters)',
    url: 'https://www.pathofexile.com/api/trade/data/stats',
    covers:
      'Room tier chains and the Open/Closed room pseudo filters used to compare Temples',
    official: true,
  },
  {
    label: 'poedb: Atlas passive skills',
    url: 'https://poedb.tw/us/Atlas_passive_skill',
    covers:
      'Incursion Atlas notables (Artefacts of the Vaal, Passage of Time, Architects of Demise)',
    official: false,
  },
  {
    label: 'poedb: Incursion',
    url: 'https://poedb.tw/us/Incursion',
    covers:
      'Architect upgrade-or-change rule, Stones of Passage, open (green) and closed (red) Altars of Passage',
    official: false,
  },
  {
    label: 'poedb: Incursion monsters (Architects)',
    url: 'https://poedb.tw/Incursion_monsters',
    covers: 'The full list of Architect names and titles',
    official: false,
  },
  {
    label: 'poedb: Royal Visage',
    url: 'https://poedb.tw/us/Royal_Visage',
    covers: 'Royal Visage item text (tier 16 non-unique map, stack of 10)',
    official: false,
  },
];
