'use client';

import { createContext, useContext } from 'react';
import { tradeLeague, tradeUrl } from '@/lib/poe1/viscera/trade';
import type { Viscera } from '@/lib/poe1/viscera/types';

/** Selected PoE 1 league, for trade links. */
export const TradeLeagueContext = createContext('Covens');

/**
 * Opens the official trade site on an Instant Buyout search for this exact
 * viscera, cheapest first. Families the trade site can't split by stat open
 * a search for every tier of that family, and say so.
 */
export function BuyLink({
  v,
  compact = false,
}: {
  v: Pick<Viscera, 'name' | 'trade'>;
  compact?: boolean;
}) {
  const league = tradeLeague(useContext(TradeLeagueContext));
  if (!v.trade) return null;
  const exact = v.trade.statIds.length > 0;
  const title = exact
    ? `Instant Buyout listings for ${v.name} in ${league}, cheapest first (opens pathofexile.com/trade)`
    : `Instant Buyout listings for every ${v.trade.type} tier in ${league} (opens pathofexile.com/trade)`;
  return (
    <a
      href={tradeUrl(v.trade, league)}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={`Buy ${v.name} on the trade site${exact ? '' : ' (all tiers)'}, opens in a new tab`}
      className="btn btn-sm tap shrink-0 rounded-full border-forge-gold/50 text-forge-rust-strong hover:bg-forge-gold/10"
    >
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2 9h8l2-6H6.2" />
        <circle cx="8.5" cy="16.5" r="1" />
        <circle cx="14.5" cy="16.5" r="1" />
      </svg>
      {compact ? 'Buy' : exact ? 'Buy' : 'Buy (all tiers)'}
    </a>
  );
}
