import { useId } from 'react';

/** The Exilewise sigil: a gilded diamond with a cross and an ember. */
export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  // Unique gradient ids: the mark renders in both header and footer.
  const id = `bm${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const gold = `${id}-gold`;
  const ember = `${id}-ember`;
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecd29a" />
          <stop offset="1" stopColor="#a87d3c" />
        </linearGradient>
        <radialGradient id={ember} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#f08a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M32 6 56 32 32 58 8 32Z"
        fill="rgb(20 17 13 / 0.85)"
        stroke={`url(#${gold})`}
        strokeWidth="2.5"
      />
      <path
        d="M32 14 49 32 32 50 15 32Z"
        fill="none"
        stroke="#c9a35f"
        strokeOpacity=".35"
      />
      <path
        d="M32 19v26M24 28h16"
        stroke={`url(#${gold})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="39" r="7" fill={`url(#${ember})`} />
      <circle cx="32" cy="39" r="2.4" fill="#f6a65a" />
    </svg>
  );
}
