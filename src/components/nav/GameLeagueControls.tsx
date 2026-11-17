'use client';

import { useRouter } from 'next/navigation';
import { useId, useTransition } from 'react';
import {
  GAME_COOKIE,
  GAME_IDS,
  GAMES,
  leagueCookie,
  PREF_COOKIE_MAX_AGE,
  type GameId,
  type LeagueOption,
} from '@/lib/games/config';

function setPrefCookie(name: string, value: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PREF_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function GameSwitch({
  game,
  size = 'md',
}: {
  game: GameId;
  size?: 'sm' | 'md';
}) {
  const router = useRouter();
  const pick = (next: GameId) => {
    setPrefCookie(GAME_COOKIE, next);
    router.push(GAMES[next].home);
  };
  return (
    <div
      role="radiogroup"
      aria-label="Game"
      className="inline-flex shrink-0 rounded-full border border-forge-border bg-forge-panel2/70 p-0.5"
    >
      {GAME_IDS.map(id => {
        const active = id === game;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => (active ? router.push(GAMES[id].home) : pick(id))}
            className={`rounded-full font-semibold transition-colors ${
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm'
            } ${
              active
                ? 'bg-forge-gold text-forge-ink shadow-xs'
                : 'text-forge-muted hover:text-forge-goldbright'
            }`}
          >
            {GAMES[id].short}
          </button>
        );
      })}
    </div>
  );
}

export function LeagueSelect({
  game,
  options,
  selected,
  className = '',
}: {
  game: GameId;
  options: LeagueOption[];
  selected: string;
  className?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const current = options.filter(o => o.current);
  const permanent = options.filter(o => !o.current);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor={id} className="sr-only">
        {GAMES[game].short} league
      </label>
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 h-2 w-2 animate-ember rounded-full bg-aurora-teal shadow-[0_0_8px_rgb(79_209_184/0.8)]"
      />
      <select
        id={id}
        value={selected}
        disabled={pending}
        onChange={e => {
          setPrefCookie(leagueCookie(game), e.target.value);
          startTransition(() => router.refresh());
        }}
        className="h-9 w-full appearance-none rounded-full max-md:h-11 border border-forge-border bg-forge-panel2/70 pl-7 pr-8 text-sm font-medium tracking-wide text-forge-goldbright transition-colors hover:border-forge-gold/60 disabled:opacity-60"
      >
        {current.length ? (
          <optgroup label="Current league">
            {current.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : null}
        {permanent.length ? (
          <optgroup label="Permanent">
            {permanent.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 h-4 w-4 text-forge-muted"
        fill="currentColor"
      >
        <path
          d="M5.5 7.5 10 12l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
