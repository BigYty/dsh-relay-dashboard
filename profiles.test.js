import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createProfileStore, normalizeToken, normalizeSite, apply } from './index.js';

function credentials() {
  let record, tail = Promise.resolve();
  return {
    async readRecord() { return structuredClone(record); },
    modifyRecord(key, mutate) {
      const update = tail.then(async () => {
        const next = await mutate(structuredClone(record));
        if (next !== undefined) record = next;
        return structuredClone(record);
      });
      tail = update.catch(() => {});
      return update;
    },
  };
}

test('quote normalization preserves plain tokens and strips pasted console quotes', () => {
  for (const value of ['abc.def', '"abc.def"', "'abc.def'", '‘abc.def’', '“abc.def”', 'Bearer abc.def', '"Bearer abc.def"']) {
    assert.equal(normalizeToken(value), 'abc.def', `normalize ${value}`);
  }
  assert.equal(normalizeSite('https://example.com/path'), 'https://example.com');
  assert.throws(() => normalizeSite('javascript:alert(1)'), /有效/);
  assert.throws(() => normalizeSite('https://name:pass@example.com'), /有效/);
});

test('concurrent site saves retain both sites and update only the selected token', async () => {
  const store = createProfileStore(credentials());
  await Promise.all([store.save({ site: 'https://a.example', token: 'first' }), store.save({ site: 'https://b.example', token: 'second' })]);
  await store.save({ site: 'https://a.example', token: 'updated' });
  const restored = await store.read();
  assert.equal(restored['https://a.example'].token, 'updated', 'selected token updated');
  assert.equal(restored['https://b.example'].token, 'second', 'other site preserved');
  assert.ok(restored['https://a.example'].updatedAt > 0, 'save time recorded');
});

test('migration keeps a newer server token and adds missing browser sites', async () => {
  const provider = credentials();
  const store = createProfileStore(provider);
  await store.save({ site: 'https://a.example', token: 'server' });
  await store.save({ site: 'https://a.example', token: 'old-browser' }, true);
  await store.save({ site: 'https://b.example', token: 'browser' }, true);
  const restored = await createProfileStore(provider).read();
  assert.equal(restored['https://a.example'].token, 'server', 'server token wins');
  assert.equal(restored['https://b.example'].token, 'browser', 'missing site migrated');
});

test('invalid token and failed storage reject without reporting success', async () => {
  const store = createProfileStore(credentials());
  await assert.rejects(store.save({ site: 'https://a.example', token: '‘’' }), /Token/);
  await assert.rejects(store.save({ site: 'https://a.example', token: 'a\nb' }), /Token/);
  const broken = createProfileStore({ modifyRecord: async () => { throw new Error('disk failure'); } });
  await assert.rejects(broken.save({ site: 'https://a.example', token: 'value' }), /disk failure/);
});

test('route enforces owner admission and never caches credential responses', async () => {
  let route, admission = { rejection: 401 };
  apply({ credentials: credentials(), connection: { admit: () => admission }, effect: effect => effect(), webServer: { register: value => { route = value; return () => {}; } } });
  async function request(method, body = '', split = false) {
    const bytes = Buffer.from(body);
    const req = Readable.from(split ? Array.from(bytes, byte => Buffer.from([byte])) : [bytes]);
    req.method = method;
    const headers = {};
    let result;
    const res = { setHeader: (key, value) => { headers[key] = value; }, end: value => { result = JSON.parse(value); } };
    await route.handler(req, res);
    return { status: res.statusCode, result, headers };
  }
  assert.equal((await request('GET')).status, 401, 'anonymous rejected');
  admission = { peer: { principal: { kind: 'viewer' } } };
  assert.equal((await request('GET')).status, 403, 'non-owner rejected');
  admission = { peer: { principal: { kind: 'owner' } } };
  const saved = await request('POST', JSON.stringify({ site: 'https://a.example', token: '‘token’' }), true);
  assert.equal(saved.status, 200, 'owner can save');
  const restored = await request('GET');
  assert.equal(restored.result.profiles['https://a.example'].token, 'token', 'server restores cleaned token');
  assert.equal(restored.headers['Cache-Control'], 'no-store', 'secret response uncached');
  assert.equal((await request('POST', '{bad')).status, 400, 'invalid JSON rejected');
  assert.equal((await request('POST', 'x'.repeat(65537))).status, 413, 'body limit enforced');
});
