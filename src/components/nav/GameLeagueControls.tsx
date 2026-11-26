'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useTransition } from 'react';
import { usePopover } from '@/components/ui/usePopover';
import {
  GAME_COOKIE,
  GAME_IDS,
  GAMES,
  isGameEnabled,
  leagueCookie,
  PREF_COOKIE_MAX_AGE,
  type GameId,
  type LeagueOption,
} from '@/lib/games/config';

function setPrefCookie(name: string, value: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PREF_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M5.5 7.5 10 12l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Game picker for the top bar: the current game's logo opens a menu of every
 * game. Games not in ENABLED_GAMES are listed as "Coming soon".
 */
export function GamePicker({
  game,
  wide = false,
}: {
  game: GameId;
  wide?: boolean;
}) {
  const router = useRouter();
  const { open, setOpen, rootRef, triggerRef } = usePopover();
  const menuId = useId();

  const pick = (next: GameId) => {
    setOpen(false);
    setPrefCookie(GAME_COOKIE, next);
    router.push(GAMES[next].home);
  };

  const current = GAMES[game];

  return (
    <div ref={rootRef} className={`relative ${wide ? 'w-full' : 'shrink-0'}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Game: ${current.name}. Change game`}
        onClick={() => setOpen(o => !o)}
        className={`flex h-9 items-center gap-2 rounded-full border border-forge-border bg-forge-panel2/70 pl-1.5 pr-2.5 transition-colors hover:border-forge-gold/60 max-md:h-11 ${
          wide ? 'w-full' : ''
        }`}
      >
        <Image
          src={current.logo.src}
          width={current.logo.width}
          height={current.logo.height}
          alt=""
          sizes="48px"
          className="h-7 w-10 object-contain max-md:h-9"
        />
        <span className="font-display text-xs font-semibold tracking-[0.16em] text-forge-goldbright">
          {current.short.toUpperCase()}
        </span>
        <Chevron
          className={`ml-auto h-4 w-4 text-forge-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <ul
          id={menuId}
          aria-label="Choose a game"
          className={`panel absolute top-full z-60 mt-2 space-y-1 bg-forge-panel p-1.5 shadow-lg ${
            wide ? 'inset-x-0' : 'left-0 w-80'
          }`}
        >
          {GAME_IDS.map(id => {
            const g = GAMES[id];
            const enabled = isGameEnabled(id);
            const active = id === game;
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!enabled}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => (active ? router.push(g.home) : pick(id))}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors ${
                    active
                      ? 'border-forge-gold/40 bg-forge-panel2'
                      : 'border-transparent'
                  } ${
                    enabled
                      ? 'hover:bg-forge-panel2/70'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <Image
                    src={g.logo.src}
                    width={g.logo.width}
                    height={g.logo.height}
                    alt=""
                    sizes="80px"
                    className={`h-12 w-16 shrink-0 object-contain ${
                      enabled ? '' : 'grayscale'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm tracking-wide text-forge-goldbright">
                      {g.name}
                    </span>
                    <span className="block text-xs text-forge-muted">
                      {enabled
                        ? active
                          ? 'You are here'
                          : 'Open tools'
                        : 'Coming soon'}
                    </span>
                  </span>
                  {active ? (
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full bg-aurora-teal shadow-[0_0_8px_rgb(79_209_184/0.8)]"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
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
      <Chevron className="pointer-events-none absolute right-3 h-4 w-4 text-forge-muted" />
    </div>
  );
}
