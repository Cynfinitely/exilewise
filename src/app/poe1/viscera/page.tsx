import { Alert } from '@/components/ui/Alert';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { seoPage } from '@/lib/seo/pages';
import { breadcrumbJsonLd, webAppJsonLd } from '@/lib/seo/jsonld';
import { ChannelSection } from '@/components/videos/ChannelSection';
import { VisceraExplorer } from '@/components/viscera/VisceraExplorer';
import { VisceraIndex } from '@/components/viscera/VisceraIndex';
import { getSelectedLeague } from '@/lib/games/selection';
import { getVisceraSnapshot, parseShareParam } from '@/lib/poe1/viscera/data';

export const metadata = pageMetadata('/poe1/viscera');

const FACTS = [
  {
    title: 'The Wickerman',
    body: 'Found in town and your hideout in Covens. It holds four viscera, one each of head, torso, upper limb and lower limb. Each character has its own, and it unlocks when you bring your first viscera back to town.',
  },
  {
    title: 'Where viscera drop',
    body: 'Campaign and map bosses empowered by Fates drop lesser, normal and greater viscera. Greater ones come from map bosses (or their Fate companions); lesser ones never drop in maps. Grim Fate pinnacle and uber bosses always drop their own viscera.',
  },
  {
    title: 'Coven Queen’s Crown',
    body: 'The Coven Queen drops a head with 2–3 random modifiers from Greater viscera, sometimes at an even stronger “Queen” tier. Viscera can be traded.',
  },
];

export default async function VisceraPage(props: {
  searchParams: Promise<{ wm?: string | string[] }>;
}) {
  const [{ wm }, league] = await Promise.all([
    props.searchParams,
    getSelectedLeague('poe1'),
  ]);
  const snapshot = getVisceraSnapshot();
  const shared = parseShareParam(
    typeof wm === 'string' ? wm : undefined,
    snapshot
  );
  const inCovens = /covens/i.test(league);

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Viscera', path: '/poe1/viscera' },
          ]),
          webAppJsonLd({
            name: 'Wickerman Planner',
            path: '/poe1/viscera',
            description: seoPage('/poe1/viscera').description,
          }),
        ]}
      />
      <header className="relative pt-2 text-center">
        <p className="eyebrow">Path of Exile · Covens league</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">
          Viscera <span className="text-forge-gold">&amp;</span> Wickerman
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-forge-muted">
          All {snapshot.viscera.length} viscera of the Covens league. Learn
          where each one drops, compare its tiers, set your four sockets and see
          the combined effect, or let it suggest a Wickerman for your build.
        </p>
        <div className="ornament mx-auto mt-6 max-w-md">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-forge-gold" />
        </div>
      </header>

      {!inCovens ? (
        <Alert tone="warn" title="Viscera are a Covens league mechanic">
          You have <b>{league}</b> selected. Viscera only drop in Covens and
          Hardcore Covens; this page still works as a reference.
        </Alert>
      ) : null}

      <div className="grid gap-8 md:grid-cols-3 md:gap-10">
        {FACTS.map((f, i) => (
          <section key={f.title} className="space-y-2">
            <p className="font-display text-sm text-forge-gold/80">
              {['I', 'II', 'III'][i]}
            </p>
            <h2 className="display text-lg">{f.title}</h2>
            <p className="text-sm leading-relaxed text-forge-muted">{f.body}</p>
          </section>
        ))}
      </div>

      <ChannelSection
        eyebrow="Covens on the channel"
        intro="Covens league videos from Cyn: farming tests, builds and the league in action. Press play to watch here."
        match={v =>
          /covens|3\.30|viscera|wickerman/i.test(`${v.title} ${v.description}`)
        }
        compact
      />

      <VisceraExplorer
        viscera={snapshot.viscera}
        shared={shared}
        league={league}
      />

      <VisceraIndex viscera={snapshot.viscera} />

      <p className="text-xs text-forge-muted">
        Data from the{' '}
        <a
          href={snapshot.source}
          className="underline underline-offset-2 hover:text-forge-goldbright"
          rel="noopener noreferrer"
          target="_blank"
        >
          Path of Exile Wiki
        </a>{' '}
        ({snapshot.license}), fetched {snapshot.fetchedAt.slice(0, 10)}. Build
        tags are inferred from stat text and are a guide, not a rule.
      </p>
    </div>
  );
}
