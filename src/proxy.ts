import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_GAME, GAMES, isGameEnabled } from '@/lib/games/config';

/**
 * Per-request Content-Security-Policy with a script nonce. Next.js reads the
 * nonce from the request's CSP header and stamps it on its own scripts, so
 * only scripts this server rendered can run.
 *
 * Styles allow inline `style=""` attributes (React uses them for dynamic
 * widths) but not injected `<style>` blocks without the nonce.
 */

/** Image hosts: GGG's CDN (PoE 2 material icons) and YouTube thumbnails. */
const IMG_HOSTS = 'https://web.poecdn.com https://i.ytimg.com';

export function buildCsp(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // Dev tooling injects unnonced <style> tags for hot reload.
    dev
      ? "style-src 'self' 'unsafe-inline'"
      : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: ${IMG_HOSTS}`,
    "font-src 'self'",
    // YouTube's privacy-enhanced player, loaded only after a click on play.
    'frame-src https://www.youtube-nocookie.com',
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** Pre-/poe2 URLs of the PoE 2 tools. */
const LEGACY_POE2 = /^\/(craft|items|materials|plans)(\/|$)/;

/**
 * Hidden-game routing: PoE 2 pages redirect to the default game while PoE 2
 * is disabled in `ENABLED_GAMES`; its JSON API (every /api route today) is
 * switched off. Returns null when the request may go through.
 */
export function gateRequest(
  pathname: string,
  origin: string
): NextResponse | null {
  const poe2 = isGameEnabled('poe2');
  if (pathname.startsWith('/api/')) {
    return poe2
      ? null
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const legacy = pathname.match(LEGACY_POE2);
  if (legacy) {
    const to = poe2 ? `/poe2${pathname}` : GAMES[DEFAULT_GAME].home;
    return NextResponse.redirect(new URL(to, origin), poe2 ? 308 : 307);
  }
  if (!poe2 && (pathname === '/poe2' || pathname.startsWith('/poe2/'))) {
    // Temporary: PoE 2 comes back later.
    return NextResponse.redirect(
      new URL(GAMES[DEFAULT_GAME].home, origin),
      307
    );
  }
  return null;
}

export function proxy(request: NextRequest) {
  const gated = gateRequest(request.nextUrl.pathname, request.nextUrl.origin);
  if (gated) return gated;
  // API responses get their static headers from next.config.mjs.
  if (request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce, process.env.NODE_ENV === 'development');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Pages and API, prefetches included: the hidden-game gate must not be
    // skippable with a prefetch header. Static files need neither gate nor CSP.
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|.*opengraph-image|poe1/viscera/.*\\.png).*)',
  ],
};
