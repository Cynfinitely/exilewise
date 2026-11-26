import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { seoPage } from '@/lib/seo/pages';
import { videoJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { getLatestVideos } from '@/lib/youtube/feed';
import { ChannelSection } from '@/components/videos/ChannelSection';
import { SubscribeButton } from '@/components/videos/SubscribeButton';
import { GameChooser } from '@/components/home/GameChooser';
import { WickermanFigure } from '@/components/viscera/WickermanFigure';
import { getVisceraSnapshot } from '@/lib/poe1/viscera/data';
import { VISCERA_SLOTS, type VisceraSlot } from '@/lib/poe1/viscera/types';

const STEPS = [
  {
    n: 'I',
    title: 'Know every viscera',
    body: 'Search all viscera by stat, boss or zone. Filter by slot, tier and act to see what you can pick up while levelling.',
    href: '/poe1/viscera',
    cta: 'Browse viscera',
  },
  {
    n: 'II',
    title: 'Fill four sockets',
    body: 'Set head, torso, arm and leg on the Wickerman and read the combined effect, from the worst roll to a perfect one.',
    href: '/poe1/viscera#wickerman',
    cta: 'Open the Wickerman',
  },
  {
    n: 'III',
    title: 'Let it choose',
    body: 'Describe your build and how far you have progressed. It ranks the viscera for each slot and fills the Wickerman for you.',
    href: '/poe1/viscera',
    cta: 'Get suggestions',
  },
];

export const metadata = pageMetadata('/');

export default async function HomePage() {
  const { viscera } = getVisceraSnapshot();
  const [latest] = await getLatestVideos();
  const bosses = new Set(viscera.flatMap(v => v.sources.map(s => s.boss)));
  // Showcase: the strongest viscera with an icon in each socket.
  const showcase = Object.fromEntries(
    VISCERA_SLOTS.map(slot => {
      const v =
        viscera.find(x => x.slot === slot && x.tier === 'uber' && x.icon) ??
        viscera.find(x => x.slot === slot && x.tier === 'greater' && x.icon);
      return [slot, v ? { name: v.name, icon: v.icon } : undefined];
    })
  ) as Partial<Record<VisceraSlot, { name: string; icon: string | null }>>;

  const stats = [
    { value: viscera.length, label: 'Viscera' },
    { value: 4, label: 'Sockets' },
    { value: bosses.size, label: 'Bosses' },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      <JsonLd
        data={[
          websiteJsonLd(seoPage('/').description),
          ...(latest ? [videoJsonLd(latest)] : []),
        ]}
      />
      <section
        aria-labelledby="choose-heading"
        className="space-y-10 pt-4 lg:pt-10"
      >
        <header className="text-center">
          <p className="eyebrow">Welcome, exile</p>
          <h1 className="display mt-4 text-4xl leading-[1.1] sm:text-5xl xl:text-6xl">
            Path of Exile tools,
            <span className="block bg-linear-to-b from-[#f3dca6] via-forge-gold to-[#8f6a31] bg-clip-text text-transparent">
              built for your league
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-forge-muted">
            Free planners, item data and guides for Path of Exile 1 and 2.
            Choose your game to see its tools. You can switch any time from the
            top bar.
          </p>
          <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-forge-border/70 bg-forge-panel/70 py-1.5 pl-5 pr-1.5 text-sm text-forge-muted">
            <a
              href="#channel"
              className="tap inline-flex items-center gap-2 underline-offset-4 hover:text-forge-goldbright hover:underline"
            >
              <span
                aria-hidden
                className="h-2 w-2 animate-ember rounded-full bg-[#e2453a] shadow-[0_0_8px_rgb(226_69_58/0.8)]"
              />
              New Path of Exile videos from Cyn on YouTube
            </a>
            <SubscribeButton className="h-9 px-4" />
          </div>
          <div className="ornament mx-auto mt-8 max-w-md">
            <h2 id="choose-heading" className="eyebrow whitespace-nowrap">
              Choose your game
            </h2>
          </div>
        </header>
        <GameChooser />
      </section>

      <div id="channel" className="scroll-mt-24">
        <ChannelSection
          title="Watch Cyn play Path of Exile on YouTube"
          intro="League starts, farming tests with real profit numbers and build guides, straight from the maps. Subscribe to catch new videos first."
        />
      </div>

      <section
        aria-labelledby="featured-heading"
        className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]"
      >
        <div className="text-center lg:text-left">
          <p className="eyebrow">Featured · PoE 1 Covens league</p>
          <h2
            id="featured-heading"
            className="display mt-4 text-4xl leading-[1.05] sm:text-5xl xl:text-6xl"
          >
            Feed the
            <span className="block bg-linear-to-b from-[#f3dca6] via-forge-gold to-[#8f6a31] bg-clip-text text-transparent">
              Wickerman
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-forge-muted lg:mx-0">
            Every viscera of the Covens league: where it drops, what it grants
            and which four belong on your effigy.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/poe1/viscera#wickerman"
              className="btn btn-primary h-12 rounded-full px-7 font-display text-sm font-bold uppercase tracking-[0.18em]"
            >
              Build your Wickerman
            </Link>
            <Link
              href="/poe1/viscera"
              className="btn h-12 rounded-full px-7 tracking-wide"
            >
              Browse all viscera
            </Link>
          </div>
          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-forge-border/60 pt-6 lg:mx-0">
            {stats.map(s => (
              <div key={s.label}>
                <dt className="font-display text-2xs uppercase tracking-[0.16em] text-forge-muted">
                  {s.label}
                </dt>
                <dd className="display mt-1 text-3xl text-forge-goldbright">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-125 rounded-full bg-[radial-gradient(closest-side,rgb(240_138_60/0.22),rgb(154_124_240/0.08)_55%,transparent)] blur-2xl"
          />
          <WickermanFigure items={showcase} className="max-w-[320px]" />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="space-y-10">
        <div className="ornament mx-auto max-w-lg">
          <h2 id="how-heading" className="eyebrow whitespace-nowrap">
            The ritual
          </h2>
        </div>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map(s => (
            <li key={s.n} className="space-y-3">
              <p className="display text-3xl text-forge-gold/70">{s.n}</p>
              <h3 className="display text-xl">{s.title}</h3>
              <p className="leading-relaxed text-forge-muted">{s.body}</p>
              <Link
                href={s.href}
                className="tap inline-flex items-center gap-2 text-sm font-medium tracking-wide text-forge-rust-strong underline-offset-4 hover:underline"
              >
                {s.cta} <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel relative overflow-hidden px-6 py-10 text-center sm:px-12">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(closest-side,rgb(79_209_184/0.18),transparent)]"
        />
        <p className="eyebrow">Wraeclast remembers</p>
        <p className="display mx-auto mt-3 max-w-2xl text-2xl leading-snug sm:text-3xl">
          Bring a boss to its knees, carry its remains to town, and the
          Wickerman grows stronger.
        </p>
        <Link
          href="/poe1/viscera"
          className="btn btn-primary mt-8 h-11 rounded-full px-6 font-display text-xs font-bold uppercase tracking-[0.18em]"
        >
          Start with the viscera
        </Link>
      </section>
    </div>
  );
}
