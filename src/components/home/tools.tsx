import Link from 'next/link';
import { NavIcon, type NavIconName } from '@/components/ui/NavIcons';
import type { GameId } from '@/lib/games/config';

// Full class names so Tailwind picks them up.
const ACCENTS = {
  lavender: 'bg-aurora-violet/10 text-aurora-violet',
  mint: 'bg-forge-mint text-affix-suffix',
  peach: 'bg-forge-peach text-rarity-unique',
  sky: 'bg-forge-sky text-info-fg',
} as const;

type Tool = {
  title: string;
  desc: string;
  icon: NavIconName;
  accent: keyof typeof ACCENTS;
  /** Omitted for tools that aren't built yet. */
  href?: string;
};

export type GameTools = {
  id: GameId;
  title: string;
  blurb: string;
  tools: Tool[];
};

/** Every tool on the site, grouped by game. Add a tool by adding an entry. */
export const GAME_TOOLS: GameTools[] = [
  {
    id: 'poe2',
    title: 'Path of Exile 2',
    blurb: 'Crafting tools built on the current game data and live prices.',
    tools: [
      {
        href: '/poe2/build-planner',
        title: 'Build Planner',
        icon: 'build',
        accent: 'lavender',
        desc: 'Paste your current and goal Path of Building, see the gap and get an AI prompt for a step-by-step upgrade plan.',
      },
      {
        href: '/poe2/craft',
        title: 'Crafting Planner',
        icon: 'craft',
        accent: 'peach',
        desc: 'Pick a base and the modifiers you want. The crafting brain simulates every technique it knows and ranks them by expected cost to finish the item.',
      },
      {
        href: '/poe2/items',
        title: 'Items & Modifiers',
        icon: 'items',
        accent: 'lavender',
        desc: 'Search any base item and see every prefix and suffix that can roll on it, with tiers, value ranges, item-level requirements and spawn weights.',
      },
      {
        href: '/poe2/materials',
        title: 'Crafting Materials',
        icon: 'materials',
        accent: 'mint',
        desc: 'Essences, omens, runes, catalysts and more: what each one does and its live price.',
      },
      {
        href: '/poe2/plans',
        title: 'Saved Plans',
        icon: 'plans',
        accent: 'sky',
        desc: "Reopen crafting plans saved in this browser and see how their cost moved with today's prices.",
      },
    ],
  },
  {
    id: 'poe1',
    title: 'Path of Exile 1',
    blurb: 'League tools for the current Covens league.',
    tools: [
      {
        href: '/poe1/build-planner',
        title: 'Build Planner',
        icon: 'build',
        accent: 'lavender',
        desc: 'Paste your current and goal Path of Building, see the gap with live prices and get an AI prompt for a step-by-step upgrade plan.',
      },
      {
        href: '/poe1/viscera',
        title: 'Viscera & Wickerman',
        icon: 'viscera',
        accent: 'peach',
        desc: 'Every viscera from the Covens league with search and filters, where each one drops, a four-slot Wickerman builder and suggestions for your build.',
      },
      {
        href: '/poe1/guides/temple-of-atzoatl-farm',
        title: 'Temple of Atzoatl Farm',
        icon: 'guides',
        accent: 'sky',
        desc: 'The 8-Thread, three-map Incursion loop that builds a Cradle of Creation Temple: setup, Architect and door choices, selling and a profit calculator.',
      },
    ],
  },
];

const CARD =
  'panel flex flex-col p-5 transition duration-300 sm:p-6 hover:-translate-y-0.5 hover:border-forge-gold/50 hover:shadow-[0_20px_50px_-20px_rgb(240_138_60/0.35)] focus-visible:rounded-2xl';

export function ToolCard({ tool }: { tool: Tool }) {
  const body = (
    <>
      <span
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-forge-gold/30 ${ACCENTS[tool.accent]}`}
      >
        <NavIcon name={tool.icon} className="h-5 w-5" />
      </span>
      <h3 className="display text-xl">{tool.title}</h3>
      <p className="mt-2 flex-1 text-sm text-forge-muted">{tool.desc}</p>
      <span
        aria-hidden
        className="mt-3 text-sm font-medium text-forge-rust-strong group-hover:underline"
      >
        {tool.href ? 'Open →' : 'Coming soon'}
      </span>
    </>
  );
  if (!tool.href) {
    return (
      <div className="panel flex flex-col p-4 opacity-70 sm:p-5">{body}</div>
    );
  }
  return (
    <Link href={tool.href} className={`group ${CARD}`}>
      {body}
    </Link>
  );
}

export function GameToolGrid({ game }: { game: GameTools }) {
  return (
    <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
      {game.tools.map(tool => (
        <ToolCard key={tool.title} tool={tool} />
      ))}
    </div>
  );
}
