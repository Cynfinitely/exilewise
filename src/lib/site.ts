/** Public site identity, shared by metadata, robots and sitemap. */
export const SITE_NAME = 'Exilewise';

/** Canonical origin. Override with NEXT_PUBLIC_SITE_URL for previews. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://exilewise.com';
