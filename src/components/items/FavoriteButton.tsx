'use client';

import { useState } from 'react';
import { browserStorage, toggleFavorite } from '@/lib/user/localStore';
import { useFavorites } from '@/lib/user/useLocalStore';

export function FavoriteButton({
  baseId,
  baseName,
  itemClass,
}: {
  baseId: string;
  /** Stored with the favorite and included in the accessible name. */
  baseName: string;
  itemClass: string;
}) {
  const favorites = useFavorites();
  const [error, setError] = useState<string | null>(null);
  const fav = favorites?.some(f => f.baseId === baseId) ?? false;

  const toggle = () => {
    const next = toggleFavorite(browserStorage(), {
      baseId,
      name: baseName,
      itemClass,
    });
    setError(
      next === null ? "Couldn't save. Your browser blocked storage." : null
    );
  };

  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={favorites === undefined}
        aria-pressed={fav}
        className={`btn shrink-0 ${fav ? 'border-forge-gold text-forge-goldbright' : ''}`}
      >
        <span aria-hidden>{fav ? '★' : '☆'}</span>
        {fav ? 'Favorited' : 'Favorite'}
        <span className="sr-only"> {baseName}</span>
      </button>
      <span
        role="status"
        className="text-2xs font-medium text-danger-fg empty:hidden"
      >
        {error}
      </span>
    </div>
  );
}
