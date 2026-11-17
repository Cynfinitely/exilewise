import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deflateSync } from 'node:zlib';
import { z } from 'zod';
import { RateLimiter } from '../src/lib/security/rateLimit';
import { guardJsonPost } from '../src/lib/security/api';
import { decodePobCode } from '../src/lib/import/pobParse';
import { buildCsp, gateRequest } from '../src/proxy';
import { isGameEnabled } from '../src/lib/games/config';

test('RateLimiter allows `limit` hits per window, then reports the wait', () => {
  const rl = new RateLimiter(2, 60_000);
  assert.deepEqual(rl.check('a', 0), { ok: true });
  assert.deepEqual(rl.check('a', 1), { ok: true });
  assert.deepEqual(rl.check('a', 2), { ok: false, retryAfterS: 60 });
  assert.deepEqual(rl.check('b', 2), { ok: true }); // per key
  assert.deepEqual(rl.check('a', 60_001), { ok: true }); // new window
});

test('RateLimiter memory stays bounded under many keys', () => {
  const rl = new RateLimiter(1, 60_000, 100);
  for (let i = 0; i < 1000; i++) rl.check(`ip${i}`, 0);
  // Internal map is private; a fresh key must still be accepted.
  assert.deepEqual(rl.check('new', 1), { ok: true });
});

const schema = z.object({ text: z.string().max(10) });
const opts = { name: 'test', schema, maxBytes: 100, perMinute: 1000 };
const post = (body: string, headers: Record<string, string> = {}) =>
  new Request('https://exilewise.com/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });

test('guardJsonPost accepts a valid same-origin body', async () => {
  const r = await guardJsonPost(
    post('{"text":"hi"}', { origin: 'https://exilewise.com' }),
    opts
  );
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.body.text, 'hi');
});

test('guardJsonPost rejects cross-site, wrong type, oversize and invalid bodies', async () => {
  const status = async (req: Request) => {
    const r = await guardJsonPost(req, opts);
    return r.ok ? 200 : r.response.status;
  };
  assert.equal(
    await status(post('{"text":"hi"}', { origin: 'https://evil.example' })),
    403
  );
  assert.equal(
    await status(post('{"text":"hi"}', { 'sec-fetch-site': 'cross-site' })),
    403
  );
  assert.equal(
    await status(post('{"text":"hi"}', { 'content-type': 'text/plain' })),
    415
  );
  assert.equal(await status(post(`{"text":"${'x'.repeat(200)}"}`)), 413);
  assert.equal(await status(post('{not json')), 400);
  assert.equal(await status(post('{"text":"far too long text"}')), 400);
});

test('guardJsonPost rate limits per client', async () => {
  const limited = { ...opts, name: 'test-limit', perMinute: 2 };
  const req = () => post('{"text":"a"}', { 'x-forwarded-for': '203.0.113.9' });
  assert.ok((await guardJsonPost(req(), limited)).ok);
  assert.ok((await guardJsonPost(req(), limited)).ok);
  const third = await guardJsonPost(req(), limited);
  assert.ok(!third.ok && third.response.status === 429);
});

test('decodePobCode refuses a decompression bomb', () => {
  const bomb = deflateSync(
    Buffer.from(`<PathOfBuilding>${' '.repeat(20 * 1024 * 1024)}`)
  );
  const code = bomb.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  assert.equal(decodePobCode(code), null);
});

test('production CSP is nonce-based with no unsafe script sources', () => {
  const csp = buildCsp('abc123', false);
  assert.match(csp, /script-src 'self' 'nonce-abc123' 'strict-dynamic'/);
  assert.doesNotMatch(csp, /unsafe-eval|script-src[^;]*unsafe-inline/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
});

test('hidden PoE 2: pages redirect to PoE 1 and the API is off', () => {
  if (isGameEnabled('poe2')) return; // gate only applies while hidden
  const origin = 'https://exilewise.com';
  const loc = (p: string) => gateRequest(p, origin)?.headers.get('location');
  assert.equal(gateRequest('/poe2/craft', origin)?.status, 307);
  assert.equal(loc('/poe2'), `${origin}/poe1`);
  assert.equal(loc('/craft'), `${origin}/poe1`);
  assert.equal(gateRequest('/api/import', origin)?.status, 404);
  assert.equal(gateRequest('/poe1/viscera', origin), null);
  assert.equal(gateRequest('/poe2-notes', origin), null); // prefix only
});
