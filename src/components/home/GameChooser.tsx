import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  GAME_IDS,
  GAMES,
  isGameEnabled,
  type GameId,
} from '@/lib/games/config';

function CardBody({ game, enabled }: { game: GameId; enabled: boolean }) {
  const g = GAMES[game];
  return (
    <>
      <div
        aria-hidden
        className={`absolute inset-x-0 -top-20 h-56 bg-[radial-gradient(closest-side,var(--glow),transparent)] transition-opacity duration-500 ${
          enabled ? 'opacity-70 group-hover:opacity-100' : 'opacity-30'
        }`}
      />
      <Image
        src={g.logo.src}
        width={g.logo.width}
        height={g.logo.height}
        alt={`${g.name} logo`}
        sizes="(min-width: 768px) 260px, 60vw"
        loading="eager"
        className={`relative mx-auto h-36 w-auto object-contain drop-shadow-[0_8px_24px_rgb(0_0_0/0.6)] transition-transform duration-500 sm:h-44 ${
          enabled ? 'group-hover:scale-[1.04]' : 'grayscale-[0.7]'
        }`}
      />
      <div className="relative mt-6 space-y-2 text-center">
        <h3 className="display text-2xl">{g.name}</h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-forge-muted">
          {g.tagline}
        </p>
      </div>
      <p className="relative mt-6 text-center">
        {enabled ? (
          <span className="btn btn-primary h-11 rounded-full px-6 font-display text-xs font-bold uppercase tracking-[0.18em]">
            Enter {g.short}
          </span>
        ) : (
          <span className="inline-flex h-11 items-center rounded-full border border-forge-border px-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-forge-muted">
            Coming soon
          </span>
        )}
      </p>
    </>
  );
}

/** Home page game picker: one card per game, unreleased ones greyed out. */
export function GameChooser() {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {GAME_IDS.map(id => {
        const enabled = isGameEnabled(id);
        const glow =
          id === 'poe1' ? 'rgb(240 138 60 / 0.28)' : 'rgb(196 40 50 / 0.3)';
        const cls =
          'panel group relative flex h-full flex-col overflow-hidden px-6 pb-8 pt-10 transition-colors';
        return (
          <li key={id} style={{ '--glow': glow } as CSSProperties}>
            {enabled ? (
              <Link
                href={GAMES[id].home}
                className={`${cls} hover:border-forge-gold/60`}
              >
                <CardBody game={id} enabled />
              </Link>
            ) : (
              <div aria-disabled className={`${cls} cursor-default`}>
                <CardBody game={id} enabled={false} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
