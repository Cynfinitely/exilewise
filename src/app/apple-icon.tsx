import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon for iOS: the gilded sigil on dark stone. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0908',
        backgroundImage:
          'radial-gradient(circle at 50% 35%, #2a2218, #0a0908 75%)',
      }}
    >
      <svg width="132" height="132" viewBox="0 0 64 64">
        <path
          d="M32 6 56 32 32 58 8 32Z"
          fill="#14110d"
          stroke="#d8b878"
          strokeWidth="2.5"
        />
        <path
          d="M32 19v26M24 28h16"
          stroke="#e2c27f"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy="39" r="2.6" fill="#f6a65a" />
      </svg>
    </div>,
    size
  );
}
