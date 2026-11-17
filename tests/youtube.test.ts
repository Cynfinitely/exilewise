import assert from 'node:assert/strict';
import { test } from 'node:test';
import { embedUrl, thumbnailUrl } from '../src/lib/youtube/channel';
import { gameOf, parseFeed } from '../src/lib/youtube/feedParse';

const entry = (id: string, title: string, published: string, extra = '') => `
 <entry>
  <yt:videoId>${id}</yt:videoId>
  <title>${title}</title>
  <published>${published}</published>
  <media:group>
   <media:description>${extra}</media:description>
   <media:community><media:statistics views="8373"/></media:community>
  </media:group>
 </entry>`;

const FEED = `<?xml version="1.0"?><feed>
${entry('N8Pfms24FwU', 'Breach Island Farming #poe2', '2026-09-19T17:43:15+00:00')}
${entry('SCJX7QejlfQ', 'Red Altars | PoE 3.30 Alch &amp; Go', '2026-11-16T06:51:14+00:00', '#CovensOfUmbra')}
${entry('bad id"><script>', 'Injected', '2026-11-17T00:00:00+00:00')}
${entry('AAAAAAAAAAA', 'No date', 'not-a-date')}
</feed>`;

test('parseFeed reads entries newest first and decodes entities', () => {
  const videos = parseFeed(FEED);
  assert.deepEqual(
    videos.map(v => v.id),
    ['SCJX7QejlfQ', 'N8Pfms24FwU']
  );
  const [latest] = videos;
  assert.equal(latest.title, 'Red Altars | PoE 3.30 Alch & Go');
  assert.equal(latest.publishedLabel, '16 Nov 2026');
  assert.equal(latest.views, 8373);
  assert.equal(latest.viewsLabel, '8.4K views');
  assert.equal(latest.game, 'poe1');
  assert.equal(videos[1].game, 'poe2');
});

test('parseFeed drops entries with malformed ids or dates', () => {
  const ids = parseFeed(FEED).map(v => v.id);
  assert.ok(!ids.some(id => id.includes('<')));
  assert.ok(!ids.includes('AAAAAAAAAAA'));
});

test('gameOf tags videos by game', () => {
  assert.equal(gameOf('Path of Exile 2 build', ''), 'poe2');
  assert.equal(
    gameOf('150 Divines Per Hour! #pathofexile2 #shorts', ''),
    'poe2'
  );
  assert.equal(gameOf('Red Altars', '#PathOfExile #CovensOfUmbra'), 'poe1');
  assert.equal(gameOf('Covens league start', ''), 'poe1');
  assert.equal(gameOf('My setup tour', ''), null);
});

test('embed and thumbnail URLs use the expected hosts', () => {
  assert.match(
    embedUrl('SCJX7QejlfQ'),
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/SCJX7QejlfQ\?/
  );
  assert.equal(
    thumbnailUrl('SCJX7QejlfQ', 'mq'),
    'https://i.ytimg.com/vi/SCJX7QejlfQ/mqdefault.jpg'
  );
});
