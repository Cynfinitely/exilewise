import type {
  VisceraSlot,
  VisceraSource,
  VisceraTier,
} from '@/lib/poe1/viscera/types';

/** Tier colours borrow the game's rarity palette: grey → blue → yellow → orange. */
export const TIER_META: Record<VisceraTier, { label: string; cls: string }> = {
  lesser: {
    label: 'Lesser',
    cls: 'border-rarity-normal/30 text-rarity-normal',
  },
  normal: {
    label: 'Normal',
    cls: 'border-rarity-magic/40 text-rarity-magic',
  },
  greater: {
    label: 'Greater',
    cls: 'border-rarity-rare/40 text-rarity-rare',
  },
  pinnacle: {
    label: 'Pinnacle',
    cls: 'border-rarity-unique/50 text-rarity-unique',
  },
  uber: {
    label: 'Uber',
    cls: 'border-danger-fg/50 text-danger-fg',
  },
  queen: {
    label: 'Queen',
    cls: 'border-aurora-violet/50 text-aurora-violet',
  },
};

export const SOURCE_LABELS = {
  campaign: 'Campaign',
  map: 'Maps',
  pinnacle: 'Pinnacle bosses',
  queen: 'Coven Queen',
} as const;

export function TierBadge({ tier }: { tier: VisceraTier }) {
  const m = TIER_META[tier];
  return (
    <span
      className={`inline-flex items-center rounded-sm border bg-forge-bg/60 px-1.5 py-px font-display text-xs font-semibold uppercase tracking-[0.16em] ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

const SLOT_GLYPH: Record<VisceraSlot, string> = {
  Head: 'M12 3a6 6 0 0 0-6 6c0 2.2 1 3.7 2 4.6V17h8v-3.4c1-.9 2-2.4 2-4.6a6 6 0 0 0-6-6ZM9 21h6',
  Torso: 'M8 4h8l3 4-2 2v10H7V10L5 8l3-4Z',
  'Upper Limb': 'M7 21v-7l-2-5 3-6h3l1 5 5 2 2 4-3 1-4-2v8',
  'Lower Limb': 'M9 3h5l-1 9 1 5 4 2v2H9l1-4-2-5 1-9Z',
};

export function SlotIcon({
  slot,
  className = 'h-4 w-4',
}: {
  slot: VisceraSlot;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={SLOT_GLYPH[slot]} />
    </svg>
  );
}

/** Item icon from public/, or the slot glyph when the snapshot has none. */
export function VisceraIcon({
  icon,
  slot,
  size = 'md',
}: {
  icon: string | null;
  slot: VisceraSlot;
  size?: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-16 w-16';
  return (
    <span
      className={`relative flex ${box} shrink-0 items-center justify-center rounded-lg border border-forge-gold/30 bg-[radial-gradient(circle_at_50%_40%,#2a2117,#0b0a08_75%)] shadow-[inset_0_0_12px_rgb(0_0_0/0.8)]`}
    >
      {icon ? (
        // Small local PNGs; next/image would add nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt=""
          width={size === 'sm' ? 32 : 48}
          height={size === 'sm' ? 32 : 48}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain p-0.5"
        />
      ) : (
        <SlotIcon slot={slot} className="h-6 w-6 text-forge-gold/60" />
      )}
    </span>
  );
}

/** Stat line with value ranges like (10-15) emphasised. */
export function StatLine({ text }: { text: string }) {
  const parts = text.split(/(\(?[+-]?\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\)?%?)/g);
  return (
    <span className="text-rarity-magic">
      {parts.map((p, i) =>
        /\d/.test(p) ? (
          <span key={i} className="font-semibold tabular-nums">
            {p}
          </span>
        ) : (
          p
        )
      )}
    </span>
  );
}

export function SourceLine({ source }: { source: VisceraSource }) {
  let where: React.ReactNode;
  if (source.kind === 'campaign') {
    where = (
      <>
        {source.act ? (
          <b className="font-semibold">Act {source.act}</b>
        ) : (
          'Campaign'
        )}
        {' · '}
        {source.where}
        {source.areaLevel ? ` (lvl ${source.areaLevel})` : ''}
      </>
    );
  } else if (source.kind === 'map') {
    where = (
      <>
        <b className="font-semibold">Map</b> · {source.where}
      </>
    );
  } else {
    where = (
      <>
        <b className="font-semibold">Key</b> · {source.where}
      </>
    );
  }
  return (
    <li className="text-xs text-forge-muted">
      <span className="text-forge-goldbright">{source.boss}</span> — {where}
    </li>
  );
}
