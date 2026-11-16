import type { Metadata } from 'next';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'Exilewise is a free helper for Path of Exile 1 and 2: browse item bases and modifiers, look up crafting materials and prices, and find the cheapest way to craft the item you want.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} · Path of Exile 1 & 2 helper`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/',
    title: `${SITE_NAME} · Path of Exile 1 & 2 helper`,
    description: DESCRIPTION,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteNav />
        <main
          id="main"
          tabIndex={-1}
          className="container-shell flex-1 py-6 outline-hidden"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
