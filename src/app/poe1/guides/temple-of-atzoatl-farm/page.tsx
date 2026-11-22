import Link from 'next/link';
import { Fill } from '@/components/guides/Fill';
import { GuideSection } from '@/components/guides/GuideSection';
import { GuideToc, type TocItem } from '@/components/guides/GuideToc';
import { Decisions } from '@/components/guides/temple/Decisions';
import {
  ProfitCalculator,
  type CalculatorDefaults,
} from '@/components/guides/temple/ProfitCalculator';
import { computeProfit } from '@/lib/poe1/guides/temple/profit';
import {
  LoopGlance,
  QuickStart,
  SetupChecklist,
} from '@/components/guides/temple/QuickStart';
import { Selling } from '@/components/guides/temple/Selling';
import { Troubleshooting } from '@/components/guides/temple/Troubleshooting';
import { Walkthrough } from '@/components/guides/temple/Walkthrough';
import { JsonLd } from '@/components/seo/JsonLd';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import {
  CHAOS_PER_DIVINE,
  GUIDE,
  GUIDE_PATH,
  LOOP_DEFAULTS,
  PRICES,
  SOURCES,
  SOURCES_ACCESSED,
} from '@/lib/poe1/guides/temple/meta';
import { articleJsonLd, breadcrumbJsonLd, videoJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { seoPage } from '@/lib/seo/pages';
import { VIDEO_ID } from '@/lib/youtube/channel';

export const metadata = pageMetadata('/poe1/guides/temple-of-atzoatl-farm');

const TOC: TocItem[] = [
  { id: 'quick-start', label: 'Quick start' },
  { id: 'setup', label: 'Setup checklist' },
  { id: 'walkthrough', label: 'Three-map walkthrough' },
  { id: 'decisions', label: 'Architects & doors' },
  { id: 'selling', label: 'Itemise & sell' },
  { id: 'calculator', label: 'Profit calculator' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'sources', label: 'Sources' },
];

const CALC_DEFAULTS: CalculatorDefaults = {
  maps: LOOP_DEFAULTS.maps,
  threads: LOOP_DEFAULTS.maps * LOOP_DEFAULTS.threadsPerMap,
  saleDiv: PRICES.featured.amountDiv,
  saleDate: PRICES.featured.date,
  mapCost: LOOP_DEFAULTS.mapCostChaos.value,
  threadCost: LOOP_DEFAULTS.threadCostChaos.value,
  royalVisage: LOOP_DEFAULTS.royalVisageChaos.value,
  otherCosts: LOOP_DEFAULTS.otherCostsChaos.value,
  minutes: LOOP_DEFAULTS.minutes.value,
  minutesObserved: LOOP_DEFAULTS.minutesObserved,
  rate: CHAOS_PER_DIVINE.value,
};

/** The calculator defaults worked through once, server-rendered. */
function ExampleResult() {
  const d = CALC_DEFAULTS;
  const chaos = (amount: number | null) => ({
    amount: amount ?? 0,
    unit: 'c' as const,
  });
  const r = computeProfit({
    maps: d.maps,
    threads: d.threads,
    minutes: d.minutes ?? Number.NaN,
    chaosPerDivine: d.rate ?? Number.NaN,
    mapCost: chaos(d.mapCost),
    threadCost: chaos(d.threadCost),
    royalVisage: chaos(d.royalVisage),
    otherCosts: chaos(d.otherCosts),
    templeSale: { amount: d.saleDiv, unit: 'div' },
    otherLoot: chaos(0),
  });
  if (r.rate === null || r.needsRate) return null;
  const div = (v: number, digits: number) =>
    `${(v / (r.rate ?? 1)).toLocaleString('en-US', { maximumFractionDigits: digits })} div`;
  const c = (v: number) => `${Math.round(v).toLocaleString('en-US')}c`;
  return (
    <div className="panel-inset space-y-2 p-4 text-sm leading-relaxed text-forge-muted">
      <h3 className="font-semibold text-forge-goldbright">
        This example, worked through
      </h3>
      <p>
        One {d.saleDiv} div gross sale on {d.saleDate}, with approximate costs
        from that day: {d.threads} Threads at {d.threadCost ?? 0}c, one Royal
        Visage at {d.royalVisage ?? 0}c, maps at {d.mapCost ?? 0}c and {r.rate}{' '}
        chaos per divine.
      </p>
      <p className="num text-forge-goldbright">
        {c(r.cost)} total cost · {c(r.net)} ({div(r.net, 3)}) net per Temple
        {r.perHour !== null
          ? ` · ${div(r.perHour, 2)} per hour at ${d.minutes} minutes`
          : ''}
      </p>
      <p className="text-xs">
        The hourly figure leaves out any time spent waiting for the Temple to
        sell. Observed loops took {d.minutesObserved} minutes. Other Temples
        sell for different amounts.
      </p>
    </div>
  );
}

function VideoBlock() {
  const id = GUIDE.videoId.value;
  if (id && VIDEO_ID.test(id)) {
    return <VideoPlayer video={{ id, title: GUIDE.videoTitle }} priority />;
  }
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-forge-gold/40 bg-forge-bg/70 p-6 text-center">
      <p className="display text-lg">The walkthrough video</p>
      <Fill field={GUIDE.videoId} />
      <Link href="/videos" className="btn tap">
        Latest videos
      </Link>
    </div>
  );
}

export default function TempleFarmGuidePage() {
  const seo = seoPage(GUIDE_PATH);
  const atlas = GUIDE.atlasTreeUrl.value;
  const rawVideoId = GUIDE.videoId.value;
  const videoId = rawVideoId && VIDEO_ID.test(rawVideoId) ? rawVideoId : null;

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'PoE 1 guides', path: '/poe1/guides' },
            { name: 'Temple of Atzoatl farm', path: GUIDE_PATH },
          ]),
          articleJsonLd({
            headline: seo.title,
            path: GUIDE_PATH,
            description: seo.description,
            dateModified: GUIDE.updatedAt,
          }),
          ...(videoId
            ? [
                videoJsonLd({
                  id: videoId,
                  title: GUIDE.videoTitle,
                  description: seo.description,
                  published: GUIDE.videoPublished,
                  publishedLabel: '',
                  views: null,
                  viewsLabel: null,
                  game: 'poe1',
                }),
              ]
            : []),
        ]}
      />

      <header className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-forge-muted">
            <Link
              href="/poe1/guides"
              className="hover:text-forge-goldbright hover:underline"
            >
              PoE 1 guides
            </Link>{' '}
            <span aria-hidden>›</span> Temple of Atzoatl farm
          </nav>
          <p className="eyebrow">
            Path of Exile {GUIDE.patch.slice(0, 4)} · {GUIDE.league} · Incursion
          </p>
          <h1 className="display text-4xl sm:text-5xl">
            Temple of Atzoatl Farm Guide
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-forge-muted">
            The full 8-Thread, three-map loop from the video: three Incursion
            maps build one Cradle of Creation Temple, which Alva itemises for
            sale. Setup, every Architect and door decision, selling and a profit
            calculator.
          </p>
          <ul className="flex flex-wrap gap-2 text-xs">
            <li className="tag-chip">
              Mechanics checked on patch {GUIDE.patch}
            </li>
            <li className="tag-chip">Updated {GUIDE.updatedAt}</li>
            <li className="tag-chip">
              Featured Temple ≈ {PRICES.featured.amountDiv} div gross on{' '}
              {PRICES.featured.date}
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {atlas ? (
              <a
                href={atlas}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary tap h-11 px-5"
              >
                View Atlas tree ↗
              </a>
            ) : (
              <span className="flex flex-wrap items-center gap-2 text-sm text-forge-muted">
                Atlas tree: <Fill field={GUIDE.atlasTreeUrl} />
              </span>
            )}
            <a href="#walkthrough" className="btn tap h-11 px-5">
              Jump to the walkthrough
            </a>
          </div>
        </div>
        <VideoBlock />
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0">
          <GuideToc items={TOC} />
        </aside>

        <div className="min-w-0 space-y-14">
          <GuideSection
            id="quick-start"
            eyebrow="Start here"
            title="Quick start"
            intro="What the farm makes, who it is for and the loop in one view. Everything below adds detail to these four steps."
          >
            <QuickStart />
            <LoopGlance />
          </GuideSection>

          <GuideSection
            id="setup"
            title="Setup checklist"
            intro="Every input in my version of the farm, why it is there and whether you need it. Required items are marked ■, optional ones □."
          >
            <SetupChecklist />
          </GuideSection>

          <GuideSection
            id="walkthrough"
            title="Three-map walkthrough"
            intro="The same four checks on every map: prepare, decide with Alva, check before leaving, and what to do when the room you want does not show up."
          >
            <Walkthrough />
          </GuideSection>

          <GuideSection
            id="decisions"
            eyebrow="Advanced"
            title="Architect and door decisions"
            intro="Every Incursion asks two questions: which Architect survives, and which door you open. Two worked examples from my run, then the rooms this farm cares about."
          >
            <Decisions />
          </GuideSection>

          <GuideSection
            id="selling"
            title="Itemise, price and sell the Temple"
            intro="Check the Chronicle, advertise what buyers filter for and price against Temples that really match yours."
          >
            <Selling />
          </GuideSection>

          <GuideSection
            id="calculator"
            title="Temple farm profit calculator"
            intro={`Put in what you actually paid and sold for. The ${PRICES.featured.amountDiv} div sale is a gross example from ${PRICES.featured.date}, not a promise. Weaker Temples, input prices and time spent all change the result.`}
          >
            <ProfitCalculator defaults={CALC_DEFAULTS} />
            <ExampleResult />
          </GuideSection>

          <GuideSection
            id="troubleshooting"
            eyebrow="Edge cases"
            title="Troubleshooting"
            intro="Disconnected rooms, weak rolls and what to do when the upgrade you planned cannot be finished."
          >
            <Troubleshooting />
          </GuideSection>

          <GuideSection
            id="sources"
            title="Sources"
            intro={`Patch-sensitive mechanics are checked against these, read on ${SOURCES_ACCESSED}. Anything not covered by them is marked “Check in game” or “To fill”.`}
          >
            <ul className="space-y-2 text-sm">
              {SOURCES.map(s => (
                <li key={s.url} className="text-forge-muted">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-forge-goldbright underline underline-offset-2 hover:text-forge-rust-strong"
                  >
                    {s.label}
                  </a>{' '}
                  <span className="text-xs">
                    ({s.official ? 'official' : 'community database'})
                  </span>
                  : {s.covers}.
                </li>
              ))}
            </ul>
          </GuideSection>
        </div>
      </div>
    </div>
  );
}
