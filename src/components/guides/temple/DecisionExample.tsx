import Image from 'next/image';
import { Fill } from '@/components/guides/Fill';
import type { WorkedExample } from '@/lib/poe1/guides/temple/decisions';
import { RoomDiagram } from './RoomDiagram';

function Answer({
  question,
  answer,
  detail,
  icon,
}: {
  question: string;
  answer: string;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border-2 border-forge-gold/60 bg-forge-bg/70 p-4 sm:p-5">
      <p className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-[0.08em] text-forge-gold sm:text-2xl">
        <span aria-hidden>{icon}</span>
        {question}
      </p>
      <p className="mt-2 text-lg font-semibold leading-snug text-forge-goldbright sm:text-xl">
        {answer}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-forge-muted">{detail}</p>
    </div>
  );
}

/** One worked Architect-and-door decision: the two answers first, then why. */
export function DecisionExample({ example }: { example: WorkedExample }) {
  const shot = example.screenshot.value;
  return (
    <article
      aria-labelledby={`${example.id}-title`}
      className="panel space-y-5 p-4 sm:p-6"
    >
      <header className="space-y-2">
        <h3 id={`${example.id}-title`} className="display text-xl sm:text-2xl">
          {example.title}
        </h3>
        <p className="leading-relaxed text-forge-muted">{example.situation}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Answer
          icon="⚔"
          question="Which architect?"
          answer={example.architect.answer}
          detail={example.architect.detail}
        />
        <Answer
          icon="⇄"
          question="Which door?"
          answer={example.door.answer}
          detail={example.door.detail}
        />
      </div>

      <div className="space-y-5">
        {shot ? (
          <figure className="space-y-2">
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1280px) 900px, 100vw"
              className="h-auto w-full rounded-xl border border-forge-border"
            />
            <figcaption className="flex flex-wrap justify-between gap-2 text-xs text-forge-muted">
              <span>
                Pre-Incursion preview in Alva’s Temple view, from my run.
              </span>
              <a
                href={shot.src}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-forge-goldbright underline underline-offset-2 hover:text-forge-rust-strong"
              >
                Open full size ↗
              </a>
            </figcaption>
          </figure>
        ) : (
          <div className="space-y-2">
            {example.diagram ? (
              <RoomDiagram
                id={`${example.id}-diagram`}
                rooms={example.diagram.rooms}
                doors={example.diagram.doors}
                summary={example.diagram.summary}
              />
            ) : null}
            <Fill field={example.screenshot} />
          </div>
        )}
        <div className="space-y-3">
          <h4 className="section-title">Step by step</h4>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-forge-goldbright marker:text-forge-gold">
            {example.steps.map(s => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {example.open.some(f => f.value === null) ? (
            <ul className="flex flex-wrap gap-2">
              {example.open.map(f => (
                <li key={f.label}>
                  <Fill field={f} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
