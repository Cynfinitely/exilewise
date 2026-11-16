import Link from 'next/link';
import { NavIcon, type NavIconName } from '@/components/ui/NavIcons';
import { SITE_NAME } from '@/lib/site';

// Full class names so Tailwind picks them up.
const ACCENTS = {
  lavender: 'bg-forge-rust/30 text-forge-gold',
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

type Game = { id: string; title: string; blurb: string; tools: Tool[] };

/** Every tool on the site, grouped by game. Add a tool by adding an entry. */
const GAMES: Game[] = [
  {
    id: 'poe2',
    title: 'Path of Exile 2',
    blurb: 'Crafting tools built on the current game data and live prices.',
    tools: [
      {
        href: '/craft',
        title: 'Crafting Planner',
        icon: 'craft',
        accent: 'peach',
        desc: 'Pick a base and the modifiers you want. The crafting brain simulates every technique it knows and ranks them by expected cost to finish the item.',
      },
      {
        href: '/items',
        title: 'Items & Modifiers',
        icon: 'items',
        accent: 'lavender',
        desc: 'Search any base item and see every prefix and suffix that can roll on it, with tiers, value ranges, item-level requirements and spawn weights.',
      },
      {
        href: '/materials',
        title: 'Crafting Materials',
        icon: 'materials',
        accent: 'mint',
        desc: 'Essences, omens, runes, catalysts and more: what each one does and its live price.',
      },
      {
        href: '/plans',
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
    blurb: 'Tools for the original game are on the way.',
    tools: [
      {
        title: 'PoE 1 tools',
        icon: 'home',
        accent: 'lavender',
        desc: 'Crafting and reference tools for Path of Exile 1 are coming soon.',
      },
    ],
  },
];

const CARD =
  'panel flex flex-col p-4 transition sm:p-5 hover:-translate-y-0.5 hover:border-forge-rust/60 hover:shadow-md focus-visible:rounded-xl';

function ToolCard({ tool }: { tool: Tool }) {
  const body = (
    <>
      <span
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${ACCENTS[tool.accent]}`}
      >
        <NavIcon name={tool.icon} className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-semibold text-forge-goldbright">
        {tool.title}
      </h3>
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

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="panel relative overflow-hidden bg-gradient-to-br from-forge-panel via-forge-panel to-forge-panel2 p-5 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-forge-mint/40 blur-3xl"
        />
        <h1 className="text-2xl font-bold text-forge-goldbright sm:text-3xl">
          {SITE_NAME}
        </h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-wide text-forge-rust-strong">
          Path of Exile 1 &amp; 2 helper
        </p>
        <p className="mt-3 max-w-2xl text-forge-muted">
          Free tools for exiles. Plan crafts, look up bases and modifiers, and
          check what your materials are worth. Start with the crafting planner:
          tell it the item you want and it works out the cheapest way to craft
          it, step by step.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/craft" className="btn btn-primary w-full sm:w-auto">
            Plan a PoE 2 craft
          </Link>
          <Link href="/items" className="btn w-full sm:w-auto">
            Browse items &amp; mods
          </Link>
        </div>
      </section>

      {GAMES.map(game => (
        <section
          key={game.id}
          aria-labelledby={`${game.id}-heading`}
          className="space-y-3"
        >
          <div>
            <h2
              id={`${game.id}-heading`}
              className="text-xl font-semibold text-forge-goldbright"
            >
              {game.title}
            </h2>
            <p className="text-sm text-forge-muted">{game.blurb}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {game.tools.map(tool => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>
      ))}

      <section className="panel-inset p-4 text-sm text-forge-muted">
        <p>
          Note: crafting mechanics change between patches. Modifier data is a
          snapshot from the community repoe-fork export, and crafting odds shown
          here are approximations meant to guide decisions, not exact in-game
          probabilities.
        </p>
      </section>
    </div>
  );
}
