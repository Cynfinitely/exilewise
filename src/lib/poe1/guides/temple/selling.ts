/**
 * Itemising, pricing and selling text. Prices themselves live in meta.ts
 * (`PRICES`) so there is one dated place to update.
 */

export const INSPECT = [
  'Hover the Chronicle of Atzoatl. Note every tier 3 room and whether it is open or closed.',
  'Check Cradle of Creation’s tier first. It sets the Temple’s price bracket.',
  'Check that Apex of Atzoatl is open. For a Cradle Temple the buyer wants to reach the end.',
  'Screenshot the hover box for the listing and for your price log.',
];

export const ADVERTISE = [
  'Cradle of Creation and its tier (area level 84, Uber Atziri).',
  'Apex of Atzoatl: open or closed.',
  'Other tier 3 rooms that buyers search for, such as Locus of Corruption and Doryani’s Institute, and whether each is open.',
  'Nothing you have not checked on the hover box.',
];

export const COMPARE = [
  'On the official trade site, type “Has Room” in the stat filter box and add each room your Temple has (Cradle of Creation, Apex of Atzoatl, …), with the right tier and set to Open Room.',
  'Match the tier and open/closed state exactly. A closed Cradle or a lower tier is a different product.',
  'Some room names on the trade site still use their pre-3.30 names (“Omnitect Forge” for Royal Forge, “Omnitect Reactor Plant” for Grand Reactor).',
  'Ignore single outliers. Look at the cheapest few listings that have been up for a while, then price just under them if you want a fast sale.',
];

/** How each price label is defined on the page. */
export const PRICE_LABELS = {
  asking:
    'A listed price. The trade site only shows asking prices, so every listing you compare against is one of these.',
  sold: 'A completed sale you made or saw happen. The only price that proves the market.',
  unsold:
    'Listed but not sold yet. Note how long, since it suggests the ask is too high.',
} as const;
