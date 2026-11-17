import { VISCERA_SLOTS, type VisceraSlot } from '@/lib/poe1/viscera/types';
import { SlotIcon } from './parts';

/** Socket centres as % of the figure box (viewBox 240×360). */
const SOCKETS: Record<VisceraSlot, { x: number; y: number; label: string }> = {
  Head: { x: 50, y: 16, label: 'Head' },
  Torso: { x: 50, y: 42, label: 'Torso' },
  'Upper Limb': { x: 19, y: 19, label: 'Arm' },
  'Lower Limb': { x: 61, y: 76, label: 'Leg' },
};

export interface SocketItem {
  name: string;
  icon: string | null;
}

/** Woven effigy strokes: a thick bronze body with a lighter dashed weave. */
function Wicker({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke="#5c4526" strokeWidth="9" />
      <path d={d} stroke="#8a6a3c" strokeWidth="6" />
      <path
        d={d}
        stroke="#d8b878"
        strokeWidth="1.4"
        strokeDasharray="2 5"
        opacity=".7"
      />
    </>
  );
}

function EffigySvg() {
  return (
    <svg
      viewBox="0 0 240 360"
      className="absolute inset-0 h-full w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <radialGradient id="wm-heart" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity=".9" />
          <stop offset=".4" stopColor="#f08a3c" stopOpacity=".45" />
          <stop offset="1" stopColor="#f08a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wm-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f08a3c" stopOpacity=".35" />
          <stop offset="1" stopColor="#f08a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="346" rx="96" ry="14" fill="url(#wm-ground)" />
      {/* Legs and binding at the feet */}
      <Wicker d="M106 204 L98 272 L90 340" />
      <Wicker d="M134 204 L142 272 L150 340" />
      <path d="M78 338h84" stroke="#5c4526" strokeWidth="5" />
      {/* Arms raised in offering */}
      <Wicker d="M88 112 L56 80 L42 34" />
      <Wicker d="M152 112 L184 80 L198 34" />
      {/* Torso: tapering cage with horizontal weave */}
      <path
        d="M84 104 Q120 94 156 104 L146 202 Q120 212 94 202 Z"
        fill="rgb(20 16 11 / 0.85)"
      />
      <Wicker d="M84 104 Q120 94 156 104 L146 202 Q120 212 94 202 Z" />
      {[124, 146, 168, 188].map(y => (
        <path
          key={y}
          d={`M${88 + (y - 104) * 0.1} ${y} Q120 ${y + 6} ${152 - (y - 104) * 0.1} ${y}`}
          stroke="#8a6a3c"
          strokeWidth="2"
          opacity=".75"
        />
      ))}
      <path d="M120 100v106" stroke="#8a6a3c" strokeWidth="2" opacity=".6" />
      <circle
        cx="120"
        cy="150"
        r="38"
        fill="url(#wm-heart)"
        className="animate-ember"
      />
      {/* Neck and woven head */}
      <path d="M120 88v14" stroke="#8a6a3c" strokeWidth="6" />
      <circle cx="120" cy="58" r="30" fill="rgb(20 16 11 / 0.85)" />
      <Wicker d="M120 28a30 30 0 1 1 0 60a30 30 0 1 1 0-60" />
      <ellipse
        cx="120"
        cy="58"
        rx="13"
        ry="30"
        stroke="#8a6a3c"
        strokeWidth="2"
        opacity=".7"
      />
      <path
        d="M92 50q28 8 56 0M92 66q28 8 56 0"
        stroke="#8a6a3c"
        strokeWidth="2"
        opacity=".7"
      />
    </svg>
  );
}

/**
 * The Wickerman with its four viscera sockets. Interactive when `onSlot` is
 * given (socket = button), otherwise decorative.
 */
export function WickermanFigure({
  items = {},
  onSlot,
  className = '',
}: {
  items?: Partial<Record<VisceraSlot, SocketItem>>;
  onSlot?: (slot: VisceraSlot) => void;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[2/3] w-full max-w-[240px] ${className}`}
    >
      <EffigySvg />
      {VISCERA_SLOTS.map(slot => {
        const pos = SOCKETS[slot];
        const item = items[slot];
        const face = (
          <>
            <span
              className={`flex h-13 w-13 items-center justify-center rounded-full border-2 bg-forge-bg/90 transition-all duration-300 ${
                item
                  ? 'border-forge-gold shadow-[0_0_18px_rgb(240_138_60/0.55)]'
                  : 'border-forge-gold/40 border-dashed group-hover:border-forge-gold group-hover:shadow-[0_0_14px_rgb(201_163_95/0.45)]'
              }`}
            >
              {item?.icon ? (
                // Small local PNG.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <SlotIcon slot={slot} className="h-5 w-5 text-forge-gold/60" />
              )}
            </span>
            <span className="mt-1 rounded-full bg-forge-bg/85 px-1.5 font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-muted">
              {pos.label}
            </span>
          </>
        );
        const style = { left: `${pos.x}%`, top: `${pos.y}%` };
        const base =
          'group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center';
        return onSlot ? (
          <button
            key={slot}
            type="button"
            style={style}
            className={`${base} tap rounded-full`}
            onClick={() => onSlot(slot)}
            aria-label={
              item
                ? `${slot}: ${item.name}. Browse ${slot.toLowerCase()} viscera`
                : `${slot}: empty. Browse ${slot.toLowerCase()} viscera`
            }
          >
            {face}
          </button>
        ) : (
          <span key={slot} style={style} className={base} aria-hidden>
            {face}
          </span>
        );
      })}
    </div>
  );
}
