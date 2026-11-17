import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import { AuroraBackdrop } from '@/components/brand/AuroraBackdrop';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getNavState } from '@/lib/games/selection';
import { CHANNEL } from '@/lib/youtube/channel';

const display = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

/**
 * Site-wide defaults only. Each page sets its own title, canonical and
 * social data via `pageMetadata` (src/lib/seo), so nothing here may describe
 * one specific page (no openGraph url/title).
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} · Path of Exile companion`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Free Path of Exile companion: Covens viscera, a Wickerman planner and videos.',
  authors: [{ name: CHANNEL.name, url: CHANNEL.url }],
  creator: CHANNEL.name,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification
            ? { other: { 'msvalidate.01': bingVerification } }
            : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0908',
  colorScheme: 'dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavState();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AuroraBackdrop />
        <SiteNav {...nav} />
        <main
          id="main"
          tabIndex={-1}
          className="container-shell flex-1 py-8 outline-hidden sm:py-10"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
