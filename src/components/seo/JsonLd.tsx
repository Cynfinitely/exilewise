import { headers } from 'next/headers';
import { serializeJsonLd, type JsonLdObject } from '@/lib/seo/jsonld';

/** Structured data block. Carries the request's CSP nonce like every script. */
export async function JsonLd({
  data,
}: {
  data: JsonLdObject | JsonLdObject[];
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // Escaped by serializeJsonLd: no `<` survives, so the tag cannot be closed early.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
