import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import { AuroraBackdrop } from '@/components/brand/AuroraBackdrop';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getNavState } from '@/lib/games/selection';

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

const DESCRIPTION =
  'Exilewise is a free Path of Exile companion. Plan your Covens league Wickerman: every viscera, where it drops, its combined bonuses and picks for your build.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} · Path of Exile companion`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/',
    title: `${SITE_NAME} · Path of Exile companion`,
    description: DESCRIPTION,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
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
