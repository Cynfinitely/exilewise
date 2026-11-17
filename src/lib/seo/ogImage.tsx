import { ImageResponse } from 'next/og';

/** Social share card size (Open Graph / X large card). */
export const OG_SIZE = { width: 1200, height: 630 };

function Sigil({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path
        d="M32 6 56 32 32 58 8 32Z"
        fill="#14110d"
        stroke="#d8b878"
        strokeWidth="2.5"
      />
      <path
        d="M32 14 49 32 32 50 15 32Z"
        fill="none"
        stroke="#c9a35f"
        strokeOpacity=".4"
      />
      <path
        d="M32 19v26M24 28h16"
        stroke="#e2c27f"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="39" r="7" fill="#f08a3c" fillOpacity=".35" />
      <circle cx="32" cy="39" r="2.6" fill="#f6a65a" />
    </svg>
  );
}

/**
 * Brand share card: dark stone, aurora glow, gilded type. Rendered at build
 * time by the `opengraph-image.tsx` file conventions.
 */
export function renderOgImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        color: '#ece2cd',
        backgroundColor: '#0a0908',
        backgroundImage:
          'radial-gradient(circle at 20% 0%, rgba(79,209,184,0.28), transparent 45%), radial-gradient(circle at 75% 10%, rgba(154,124,240,0.28), transparent 45%), radial-gradient(circle at 50% 120%, rgba(240,138,60,0.35), transparent 55%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Sigil size={64} />
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6 }}>
          EXILE<span style={{ color: '#c9a35f' }}>WISE</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 6,
            color: '#e4a862',
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#f3dca6',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#c2b8a3',
            maxWidth: 980,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          height: 2,
          width: '100%',
          backgroundImage:
            'linear-gradient(90deg, transparent, #c9a35f, transparent)',
        }}
      />
    </div>,
    OG_SIZE
  );
}
