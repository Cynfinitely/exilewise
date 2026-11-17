import 'server-only';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { RateLimiter } from './rateLimit';

/**
 * Shared guard for the JSON POST endpoints: same-origin only, rate limited,
 * bounded body size, schema-validated. Every failure returns a fixed message;
 * details are logged server-side only.
 */

const limiters = new Map<string, RateLimiter>();

function limiterFor(name: string, perMinute: number): RateLimiter {
  let l = limiters.get(name);
  if (!l) {
    l = new RateLimiter(perMinute, 60_000);
    limiters.set(name, l);
  }
  return l;
}

/** Client address as reported by the hosting proxy (first hop). */
function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim().slice(0, 64) || 'unknown';
  return request.headers.get('x-real-ip')?.slice(0, 64) ?? 'unknown';
}

/**
 * Browsers send `Sec-Fetch-Site` and `Origin`; a request from another site is
 * refused so third-party pages cannot spend this server's CPU through a
 * visitor's browser. Non-browser clients send neither and are only rate limited.
 */
function isCrossSite(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

function fail(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

export type Guarded<T> =
  { ok: true; body: T } | { ok: false; response: NextResponse };

export async function guardJsonPost<S extends z.ZodType>(
  request: Request,
  opts: { name: string; schema: S; maxBytes: number; perMinute: number }
): Promise<Guarded<z.infer<S>>> {
  if (isCrossSite(request)) {
    return { ok: false, response: fail(403, 'Forbidden') };
  }

  const limited = limiterFor(opts.name, opts.perMinute).check(
    clientIp(request)
  );
  if (!limited.ok) {
    return {
      ok: false,
      response: fail(429, 'Too many requests. Try again shortly.', {
        'Retry-After': String(limited.retryAfterS),
      }),
    };
  }

  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    return { ok: false, response: fail(415, 'Expected application/json') };
  }

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > opts.maxBytes) {
    return { ok: false, response: fail(413, 'Request too large') };
  }

  let raw: string;
  try {
    raw = await readCapped(request, opts.maxBytes);
  } catch {
    return { ok: false, response: fail(413, 'Request too large') };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: fail(400, 'Invalid JSON') };
  }

  const parsed = opts.schema.safeParse(json);
  if (!parsed.success) {
    console.warn(
      `[api/${opts.name}] rejected body`,
      parsed.error.issues.slice(0, 3)
    );
    return { ok: false, response: fail(400, 'Invalid request') };
  }
  return { ok: true, body: parsed.data };
}

/** Reads the body as text, aborting once it passes `maxBytes` (chunked bodies have no length header). */
async function readCapped(request: Request, maxBytes: number): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('body too large');
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
