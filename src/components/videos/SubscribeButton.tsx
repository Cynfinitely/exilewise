import { CHANNEL } from '@/lib/youtube/channel';

/** Opens the channel with YouTube's subscribe prompt. */
export function SubscribeButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={CHANNEL.subscribeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e2453a]/70 bg-linear-to-b from-[#d4362c] to-[#9c1f17] px-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_-10px_rgb(212_54_44/0.8)] transition-shadow hover:shadow-[0_10px_30px_-8px_rgb(226_69_58/0.95)] ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5.2 3Z" />
      </svg>
      Subscribe
      <span className="sr-only">
        to {CHANNEL.name} on YouTube (opens in a new tab)
      </span>
    </a>
  );
}
