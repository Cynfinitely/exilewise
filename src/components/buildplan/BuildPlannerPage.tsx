import { BuildPlanner } from '@/components/buildplan/BuildPlanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { GAMES, type GameId } from '@/lib/games/config';
import { getSelectedLeague } from '@/lib/games/selection';
import { breadcrumbJsonLd, webAppJsonLd } from '@/lib/seo/jsonld';

const HOW = [
  {
    title: 'Paste two builds',
    body: 'Your character as it is today, and the build you are aiming for: a guide’s Path of Building, a poe.ninja character or your own plan.',
  },
  {
    title: 'See the gap',
    body: 'Life, resistances and DPS side by side, every gear slot that changes, gems to buy or level, passive points to move and live prices for the uniques you still need.',
  },
  {
    title: 'Tell it your situation',
    body: 'Budget, income, play time, trade or SSF, softcore or hardcore, goals and what is killing you. Every answer shapes the plan.',
  },
  {
    title: 'Get your AI prompt',
    body: 'One detailed prompt with both builds as data and strict rules for the answer. Paste it into ChatGPT, Claude or Gemini for a phased upgrade plan.',
  },
];

const FAQ = [
  {
    q: 'Which build links work?',
    a: 'pobb.in, pastebin.com and poe.ninja build links, or the raw code from Path of Building’s Import/Export tab. Exilewise reads the build once to compare it and does not store it.',
  },
  {
    q: 'Why a prompt instead of an answer on the page?',
    a: 'You choose the AI and can ask follow-up questions in the same chat. The prompt gives it exact data from both builds, so it doesn’t have to guess your gear or tree.',
  },
  {
    q: 'Which set does it read when my PoB has several?',
    a: 'The active tree, skill set and item set, the ones selected when you exported. Switch to your end-game sets before you export a guide build.',
  },
  {
    q: 'How accurate are the prices?',
    a: 'Unique and gem prices come from poe.ninja for your selected league and refresh every 15 minutes. Rare items have no fixed price, so the AI estimates those.',
  },
];

/** Shared page body for /poe1/build-planner and /poe2/build-planner. */
export async function BuildPlannerPage({ game }: { game: GameId }) {
  const league = await getSelectedLeague(game);
  const g = GAMES[game];
  const path = `${g.home}/build-planner`;
  const description =
    'Compare your current Path of Building with your goal build and get a detailed AI prompt for a step-by-step upgrade plan that fits your budget.';

  return (
    <div className="space-y-12">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: g.name, path: g.home },
            { name: 'Build Planner', path },
          ]),
          webAppJsonLd({ name: `${g.short} Build Planner`, path, description }),
        ]}
      />
      <header className="pt-2 text-center">
        <p className="eyebrow">
          {g.name} · {league}
        </p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">
          {g.short} Build Planner
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-forge-muted">
          Compare the build you have with the build you want, then get an AI
          prompt that plans every step between them: what to buy, craft, level
          and respec, in the order that fits your budget.
        </p>
        <div className="ornament mx-auto mt-6 max-w-md">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-forge-gold" />
        </div>
      </header>

      <BuildPlanner game={game} league={league} />

      <section aria-labelledby="how-heading" className="space-y-8">
        <div className="ornament mx-auto max-w-lg">
          <h2 id="how-heading" className="eyebrow whitespace-nowrap">
            How it works
          </h2>
        </div>
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {HOW.map((s, i) => (
            <li key={s.title} className="space-y-2">
              <p className="display text-2xl text-forge-gold/70">
                {['I', 'II', 'III', 'IV'][i]}
              </p>
              <h3 className="display text-lg">{s.title}</h3>
              <p className="text-sm leading-relaxed text-forge-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl space-y-6"
      >
        <h2 id="faq-heading" className="display text-center text-2xl">
          Questions
        </h2>
        <dl className="space-y-5">
          {FAQ.map(f => (
            <div key={f.q} className="panel-inset p-4">
              <dt className="font-medium text-forge-goldbright">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-forge-muted">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
