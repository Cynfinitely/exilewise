import {
  MaterialsBrowser,
  type MaterialsCatalog,
  type MaterialView,
} from '@/components/materials/MaterialsBrowser';
import {
  currencyMisc,
  currencyTierRows,
  essenceMatrix,
  gemsAndOther,
  leagueGroups,
  omens,
  runes,
  soulCores,
  type Material,
  type MaterialTier,
} from '@/lib/materials/source';
import { getPriceByApiId } from '@/lib/pricing/poe2scout';
import { getSelectedLeague } from '@/lib/games/selection';
import { Suspense } from 'react';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Crafting Materials',
};

function toView(m: Material, prices: Map<string, number>): MaterialView {
  return {
    apiId: m.apiId,
    name: m.name,
    label: m.label,
    tier: m.tier,
    effect: m.effect,
    description: m.description,
    iconUrl: m.iconUrl,
    stackSize: m.stackSize,
    maxStackSize: m.maxStackSize,
    priceExalted: prices.get(m.apiId) ?? null,
  };
}

function tierEntry(m: Material, prices: Map<string, number>) {
  return {
    apiId: m.apiId,
    name: m.name,
    effect: m.effect,
    priceExalted: prices.get(m.apiId) ?? null,
  };
}

export default async function MaterialsPage() {
  const league = await getSelectedLeague('poe2');
  const prices = await getPriceByApiId(league);
  // getPriceByApiId swallows fetch errors and returns an empty map, so an
  // empty map means live prices could not be loaded.
  const pricesUnavailable = prices.size === 0;

  const catalog: MaterialsCatalog = {
    essenceRows: essenceMatrix().map(row => ({
      family: row.family,
      tiers: Object.fromEntries(
        Object.entries(row.tiers).map(([tier, m]) => [
          tier as MaterialTier,
          tierEntry(m, prices),
        ])
      ) as MaterialsCatalog['essenceRows'][0]['tiers'],
    })),
    currencyRows: currencyTierRows().map(row => ({
      family: row.family,
      tiers: Object.fromEntries(
        Object.entries(row.tiers).map(([tier, m]) => [
          tier as MaterialTier,
          tierEntry(m, prices),
        ])
      ) as MaterialsCatalog['currencyRows'][0]['tiers'],
    })),
    currencyMisc: currencyMisc().map(m => toView(m, prices)),
    omens: omens().map(m => toView(m, prices)),
    runes: runes().map(m => toView(m, prices)),
    soulCores: soulCores().map(m => toView(m, prices)),
    leagueGroups: leagueGroups().map(g => ({
      label: g.label,
      items: g.items.map(m => toView(m, prices)),
    })),
    gemsGroups: gemsAndOther().map(g => ({
      label: g.label,
      items: g.items.map(m => toView(m, prices)),
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crafting Materials"
        description={
          <>
            Every Path of Exile 2 crafting currency and material, with its exact
            in-game effect and a live market price. Essences list their
            guaranteed modifier values per item class. Prices are from poe2scout
            for {league}.
          </>
        }
      />
      {pricesUnavailable ? (
        <Alert tone="warn">
          Live prices unavailable — showing materials without prices.
        </Alert>
      ) : null}
      {/* useSearchParams in MaterialsBrowser needs a Suspense boundary. */}
      <Suspense fallback={<MaterialsBrowser catalog={catalog} />}>
        <MaterialsBrowser catalog={catalog} syncUrl />
      </Suspense>
    </div>
  );
}
