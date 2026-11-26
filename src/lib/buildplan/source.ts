import 'server-only';
import { decodePobCode } from '@/lib/import/pobParse';

/**
 * Turns what the visitor pasted (a build link or a raw PoB code) into PoB
 * XML. Links are only fetched from a fixed list of build-sharing sites, by
 * an id checked against a strict pattern, so the server never requests a
 * URL chosen by the visitor.
 */

const USER_AGENT = 'exilewise/0.1 (+https://exilewise.com)';
const TIMEOUT_MS = 8_000;
/** Raw PoB codes for big builds are a few hundred KB of base64. */
const MAX_CODE_BYTES = 600_000;

export class BuildSourceError extends Error {}

/** The fixed raw-code URL for a supported build link, or null. */
export function rawUrlFor(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^www\./, '');
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'pobb.in') {
    const id = parts[0] === 'pob' ? parts[1] : parts[0];
    return id && /^[A-Za-z0-9_-]{4,40}$/.test(id)
      ? `https://pobb.in/${id}/raw`
      : null;
  }
  if (host === 'pastebin.com') {
    const id = parts[0] === 'raw' ? parts[1] : parts[0];
    return id && /^[A-Za-z0-9]{4,16}$/.test(id)
      ? `https://pastebin.com/raw/${id}`
      : null;
  }
  if (host === 'poe.ninja') {
    // poe.ninja/pob/<id>, /poe1/pob/<id>, /poe2/pob/<id>, optionally /raw/.
    const i = parts.indexOf('pob');
    if (i < 0) return null;
    const game = parts[0] === 'poe2' ? 'poe2' : 'poe1';
    const id = parts[i + 1] === 'raw' ? parts[i + 2] : parts[i + 1];
    return id && /^[A-Za-z0-9_-]{2,40}$/.test(id)
      ? `https://poe.ninja/${game}/pob/raw/${id}`
      : null;
  }
  return null;
}

export function looksLikeUrl(input: string): boolean {
  return /^\s*(https?:\/\/|www\.|pobb\.in|pastebin\.com|poe\.ninja)/i.test(
    input
  );
}

async function fetchCode(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/plain,*/*' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // The URL is built from a fixed host; never follow a redirect elsewhere.
      redirect: 'error',
      cache: 'no-store',
    });
  } catch {
    throw new BuildSourceError(
      'Could not reach that build site. Try again, or paste the PoB code instead.'
    );
  }
  if (res.status === 404) {
    throw new BuildSourceError('That build link was not found.');
  }
  if (!res.ok) {
    throw new BuildSourceError(
      'The build site did not answer. Try again, or paste the PoB code instead.'
    );
  }
  const declared = Number(res.headers.get('content-length') ?? '0');
  if (declared > MAX_CODE_BYTES) {
    throw new BuildSourceError('That build is too large to read.');
  }
  const text = await res.text();
  if (text.length > MAX_CODE_BYTES) {
    throw new BuildSourceError('That build is too large to read.');
  }
  return text;
}

/** Resolves a link or code to PoB XML, or throws a BuildSourceError. */
export async function loadBuildXml(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) throw new BuildSourceError('Paste a build link or PoB code.');

  let code = trimmed;
  if (looksLikeUrl(trimmed)) {
    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const raw = rawUrlFor(withScheme);
    if (!raw) {
      throw new BuildSourceError(
        'Use a pobb.in, pastebin.com or poe.ninja build link, or paste the PoB code.'
      );
    }
    code = await fetchCode(raw);
  }

  const xml = decodePobCode(code);
  if (!xml) {
    throw new BuildSourceError(
      'That is not a Path of Building code. In PoB use Import/Export → Generate, then copy the code or the link.'
    );
  }
  return xml;
}
