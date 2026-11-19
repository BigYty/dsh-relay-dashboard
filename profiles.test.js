import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { createProfileStore, normalizeToken, normalizeSite, apply, PluginError, publicAddress } from './index.js';
import { buildCommand, install, parseArgs } from './scripts/import-profile.mjs';

function credentials(initial) {
  let record = structuredClone(initial);
  let tail = Promise.resolve();
  return {
    async readRecord() { await tail; return structuredClone(record); },
    modifyRecord(key, mutate) {
      const update = tail.then(async () => {
        const next = await mutate(structuredClone(record));
        if (next !== undefined) {
          assert.deepEqual(next, JSON.parse(JSON.stringify(next)), 'stored records must survive a JSON round trip exactly');
          record = next;
        }
        return structuredClone(record);
      });
      tail = update.catch(() => {});
      return update;
    },
    async deleteRecord() { await tail; record = undefined; },
  };
}

const ok = data => ({ status: 200, payload: { code: 0, data } });
const auth = (access = 'access-1', refresh = 'refresh-1', expires = 3600) => ({
  access_token: access, refresh_token: refresh, expires_in: expires, token_type: 'Bearer',
});
const syntheticPassword = ['transient', 'password'].join('-');
const legacyTokenValue = ['legacy', 'secret'].join('-');
const secondTokenValue = ['second', 'secret'].join('-');
const manualTokenValue = ['manual', 'access'].join('-');
const sampleData = {
  '/user/profile': { email: 'private@example.invalid', id: 'private-user-id', balance: 12.5 },
  '/usage/dashboard/stats': {
    today_requests: 3, total_requests: 8, today_tokens: 120, today_input_tokens: 90,
    today_output_tokens: 30, total_tokens: 800, total_api_keys: 2, active_api_keys: 1,
    internal: 'must-not-reach-client', by_platform: [{ platform: 'api', total_cost: 2, private_key: 'must-not-reach-client' }],
  },
  '/usage/dashboard/trend': [{ date: '2026-11-17', total_tokens: 120, private_note: 'must-not-reach-client' }],
  '/usage/dashboard/models': [{ model: 'example-model', total_tokens: 120, total_requests: 3, private_note: 'must-not-reach-client' }],
};

test('direct Token guidance avoids undocumented browser storage formats', async () => {
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  const chinese = source.match(/zh: \{[\s\S]*?tokenLoginHint: '([^']+)'/);
  const english = source.match(/en: \{[\s\S]*?tokenLoginHint: '([^']+)'/);
  assert.ok(chinese);
  assert.ok(english);
  assert.match(chinese[1], /站明确提供的 API 访问 Token/);
  assert.match(english[1], /API access token the gateway explicitly provides/);
  assert.doesNotMatch(chinese[1] + english[1], /localStorage|developer tools console|auth_token/);
  assert.match(source, /h\('p', \{ className: 'relay-auth-note' \}, t\('tokenLoginHint'\)\)/);
});

test('site cards localize each persisted credential status without conflating verified Tokens with renewal', async () => {
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  const status = source.match(/function siteCredentialStatus\(profile, now = Date\.now\(\)\) \{([\s\S]*?)\n    \}/);
  assert.ok(status);
  assert.match(status[1], /if \(profile\.hasRefreshToken\) return t\('statusRenewal'\)/);
  assert.match(status[1], /if \(profile\.hasAccessToken && profile\.verifiedAt\) return t\('statusTokenVerified'\)/);
  assert.match(status[1], /if \(profile\.hasAccessToken\) return t\('statusTokenUnverified'\)/);
  assert.match(source, /h\('span', \{ className: 'relay-section-meta' \}, siteCredentialStatus\(profile, now\)\)/);
  assert.match(source, /statusTokenVerified: 'Token 已验证，自动续期不可用'/);
  assert.match(source, /statusTokenUnverified: 'Token 尚未验证'/);
  assert.match(source, /statusRenewal: '自动续期已启用'/);
});

function upstreamForDashboard(options = {}) {
  const calls = [];
  const request = async (site, path, input = {}) => {
    calls.push({ site, path, ...structuredClone(input) });
    if (path === '/auth/login') return ok(options.loginResult || auth());
    if (path === '/auth/login/2fa') return ok(options.twoFactorResult || auth('access-2', 'refresh-2'));
    if (path === '/auth/refresh') return ok(options.refreshResult || auth('access-2', 'refresh-2'));
    if (options.rejectOldAccess && input.accessToken === 'access-1') {
      throw new PluginError('unused upstream details', 401, 'upstream-rejected');
    }
    return ok(sampleData[path]);
  };
  return { calls, request };
}

test('one-step profile import calls the DSH plugin manager with validated arguments', () => {
  const parsed = parseArgs(['--profile', 'work-2', '--bundle', './relay-dashboard.tgz']);
  const command = buildCommand(parsed);
  assert.equal(command.executable, 'dsh');
  assert.deepEqual(command.args.slice(0, 4), ['plugin', '--profile', 'work-2', 'add']);
  assert.ok(command.args[4].endsWith('/relay-dashboard.tgz'));

  let received;
  install(parsed, (...args) => { received = args; return { status: 0 }; });
  assert.deepEqual(received[1], command.args);
  assert.equal(received[2].stdio, 'inherit');
  assert.throws(() => parseArgs(['--bundle', '/tmp/plugin']), /--profile/);
  assert.throws(() => parseArgs(['--profile', '../outside', '--bundle', '/tmp/plugin']), /Profile name/);
  assert.throws(() => parseArgs(['--profile', 'work', '--bundle', '-bad']), /--bundle requires/);
});

test('profile import reports installer errors and non-zero exits', () => {
  assert.throws(() => install({ profile: 'work', bundle: '/tmp/plugin' }, () => ({ status: 1 })), /exit status 1/);
  assert.throws(() => install({ profile: 'work', bundle: '/tmp/plugin' }, () => ({ error: new Error('missing dsh') })), /Could not start/);
});

test('normalizes pasted credentials and rejects unsafe origin syntax', () => {
  for (const value of ['abc.def', '"abc.def"', "'abc.def'", '‘abc.def’', '“abc.def”', 'Bearer abc.def', '"Bearer abc.def"']) {
    assert.equal(normalizeToken(value), 'abc.def');
  }
  assert.equal(normalizeSite('https://example.com/path'), 'https://example.com');
  assert.throws(() => normalizeSite('javascript:alert(1)'), /有效/);
  assert.throws(() => normalizeSite('https://name:pass@example.com'), /有效/);
});

test('rejects private, loopback, link-local, and reserved network addresses', () => {
  for (const address of ['127.0.0.1', '10.0.0.4', '169.254.1.2', '192.168.1.9', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1']) {
    assert.equal(publicAddress(address), false, `${address} is not publicly routable`);
  }
  assert.equal(publicAddress('8.8.8.8'), true, 'public IPv4 is accepted');
  assert.equal(publicAddress('2606:4700:4700::1111'), true, 'public IPv6 is accepted');
});

test('token-only login makes no dashboard calls and exposes no refresh credential', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard();
  const store = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  const result = await store.login({
    site: 'https://sub2api.example', email: 'user@example.invalid', password: syntheticPassword, mode: 'token',
  });
  assert.deepEqual(Object.keys(result), ['accessToken']);
  assert.equal(result.accessToken, 'access-1');
  assert.deepEqual(upstream.calls.map(call => call.path), ['/auth/login']);
  assert.deepEqual(upstream.calls[0].body, { email: 'user@example.invalid', password: syntheticPassword });
  const record = await provider.readRecord('relay-dashboard/sites');
  assert.equal(record.payload.profiles['https://sub2api.example'].refreshToken, 'refresh-1');
  const listing = await store.list();
  assert.deepEqual(listing['https://sub2api.example'], {
    updatedAt: 1000000, expiresAt: 4600000, hasAccessToken: true, hasRefreshToken: true, verifiedAt: 0, needsTwoFactor: false, pendingMode: '',
  });
  assert.equal(JSON.stringify(listing).includes('access-1'), false);
  assert.equal(JSON.stringify(result).includes('refresh-1'), false);
});

test('manual Token verification persists per site and restores the correct status after returning', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard();
  const store = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  const profiles = await store.saveToken('https://gateway.example', `Bearer ${manualTokenValue}`);
  await store.saveToken('https://other-gateway.example', 'other-site-token');
  await store.login({ site: 'https://renewable.example', email: 'renewable@example.invalid', password: syntheticPassword, mode: 'token' });
  const restoredStore = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  const dashboard = await restoredStore.dashboard('https://gateway.example', '7');
  const saved = (await provider.readRecord('relay-dashboard/sites')).payload.profiles['https://gateway.example'];
  const returnedStore = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  const returnedProfiles = await returnedStore.list();

  assert.deepEqual(profiles['https://gateway.example'], {
    updatedAt: 1000000, expiresAt: 1000000 + 86400000, hasAccessToken: true, hasRefreshToken: false, verifiedAt: 0, needsTwoFactor: false, pendingMode: '',
  }, 'manual Token saving returns only a sanitized profile summary');
  assert.equal(saved.accessToken, manualTokenValue, 'the Host credential record retains the normalized Token');
  assert.equal(saved.refreshToken, '', 'manual Tokens do not inherit refresh credentials');
  assert.equal(saved.verifiedAt, 1000000, 'a successful dashboard query persists a per-site verification timestamp');
  assert.equal(dashboard.profile.balance, 12.5, 'a later store instance can query with the persisted Token');
  assert.deepEqual(returnedProfiles['https://gateway.example'], {
    updatedAt: 1000000, expiresAt: 1000000 + 86400000, hasAccessToken: true, hasRefreshToken: false, verifiedAt: 1000000, needsTwoFactor: false, pendingMode: '',
  }, 'a new page/store instance restores the verified state for the Token site');
  assert.deepEqual(returnedProfiles['https://other-gateway.example'], {
    updatedAt: 1000000, expiresAt: 1000000 + 86400000, hasAccessToken: true, hasRefreshToken: false, verifiedAt: 0, needsTwoFactor: false, pendingMode: '',
  }, 'verifying one site does not change another site state');
  assert.deepEqual(returnedProfiles['https://renewable.example'], {
    updatedAt: 1000000, expiresAt: 4600000, hasAccessToken: true, hasRefreshToken: true, verifiedAt: 0, needsTwoFactor: false, pendingMode: '',
  }, 'another account site retains its automatic-renewal status');
  assert.deepEqual(upstream.calls.filter(call => call.site === 'https://gateway.example').map(call => call.path), [
    '/user/profile', '/usage/dashboard/stats', '/usage/dashboard/trend', '/usage/dashboard/models',
  ], 'manual Token mode queries the dashboard resources');
  assert.ok(upstream.calls.filter(call => call.site === 'https://gateway.example').every(call => call.accessToken === manualTokenValue), 'only the submitted Token authorizes these requests');
  assert.equal(JSON.stringify(profiles).includes(manualTokenValue), false, 'the saved Token is never returned in the profile summary');
});

test('manual Token expires after 24 hours and follows the existing reauthentication path', async () => {
  let clock = 1000000;
  const upstream = upstreamForDashboard();
  const store = createProfileStore(credentials(), { request: upstream.request, now: () => clock });
  await store.saveToken('https://expiring-manual.example', manualTokenValue);
  clock += 24 * 60 * 60 * 1000;
  await assert.rejects(
    store.dashboard('https://expiring-manual.example', 7),
    error => error.code === 'reauth-required' && error.status === 401,
  );
  assert.deepEqual(upstream.calls, [], 'expired manual Tokens do not make upstream requests or attempt refresh');
});

test('maps an interactive verification challenge to an explicit non-bypass path', async () => {
  const store = createProfileStore(credentials(), {
    request: async () => { throw new PluginError('challenge rejected', 403, 'upstream-rejected'); },
  });
  await assert.rejects(
    store.login({ site: 'https://gateway.example', email: 'user@example.invalid', password: syntheticPassword, mode: 'dashboard' }),
    error => error.code === 'login-challenge'
      && /官方页面/.test(error.message)
      && /不会生成或绕过/.test(error.message),
  );
});

test('maps rejected gateway credentials to a login error, not a storage error', async () => {
  const store = createProfileStore(credentials(), {
    request: async () => { throw new PluginError('gateway details', 401, 'upstream-rejected'); },
  });
  await assert.rejects(
    store.login({ site: 'https://sub2api.example', email: 'user@example.invalid', password: syntheticPassword, mode: 'token' }),
    error => error.status === 401 && error.code === 'login-rejected' && !error.message.includes('gateway details'),
  );
});

test('dashboard login requests only the four dashboard resources and returns minimized fields', async () => {
  const upstream = upstreamForDashboard();
  const store = createProfileStore(credentials(), { request: upstream.request, now: () => 1000000 });
  const result = await store.login({
    site: 'https://sub2api.example', email: 'user@example.invalid', password: 'temporary', mode: 'dashboard',
  });
  assert.deepEqual(upstream.calls.map(call => call.path), [
    '/auth/login', '/user/profile', '/usage/dashboard/stats', '/usage/dashboard/trend', '/usage/dashboard/models',
  ]);
  assert.deepEqual(result.dashboard.profile, { balance: 12.5 });
  assert.equal(result.dashboard.stats.internal, undefined);
  assert.equal(result.dashboard.stats.by_platform[0].private_key, undefined);
  assert.equal(result.dashboard.trend[0].private_note, undefined);
  assert.equal(result.dashboard.models[0].private_note, undefined);
  assert.equal(JSON.stringify(result).includes('private@example.invalid'), false);
  assert.equal(JSON.stringify(result).includes('private-user-id'), false);
});

test('summaries expose real expiry timestamps and normalize invalid stored expiry as unavailable', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard({ loginResult: auth('expiring-access', 'expiring-refresh', 120) });
  const store = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  await store.login({ site: 'https://expiring.example', email: 'u@example.invalid', password: 'x', mode: 'token' });
  await store.saveToken('https://manual.example', manualTokenValue);
  const profiles = await store.list();
  assert.equal(profiles['https://expiring.example'].expiresAt, 1000000 + 120000);
  assert.equal(profiles['https://manual.example'].expiresAt, 1000000 + 86400000);
  const record = (await provider.readRecord('relay-dashboard/sites')).payload;
  record.profiles['https://invalid.example'] = { accessToken: 'invalid-token', expiresAt: 'not-a-time', updatedAt: 1000000 };
  record.profiles['https://negative.example'] = { accessToken: 'negative-token', expiresAt: -1, updatedAt: 1000000 };
  const invalidProvider = credentials({ kind: 'grant', payload: record });
  const invalidProfiles = await createProfileStore(invalidProvider).list();
  assert.equal(invalidProfiles['https://invalid.example'].expiresAt, 0);
  assert.equal(invalidProfiles['https://negative.example'].expiresAt, 0);
});

test('the Client countdown is time-based, refreshes while mounted, and isolates each card profile', async () => {
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  assert.match(source, /function formatCountdown\(expiresAt, now\)/);
  assert.match(source, /const timer = setInterval\(\(\) => setNow\(Date\.now\(\)\), 1000\)/);
  assert.match(source, /formatCountdown\(profile\.expiresAt, now\)/);
  assert.match(source, /formatCredentialTime\(profile\.expiresAt\)/);
  assert.match(source, /if \(profile\.expiresAt > 0 && profile\.expiresAt <= now && !profile\.hasRefreshToken\)/);
});

test('refresh rotation retries unauthorized dashboard calls with the new access token', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard({ rejectOldAccess: true });
  const store = createProfileStore(provider, { request: upstream.request, now: () => 1000000 });
  await store.login({ site: 'https://sub2api.example', email: 'u@example.invalid', password: 'x', mode: 'token' });
  const dashboard = await store.dashboard('https://sub2api.example', 30);
  assert.equal(dashboard.profile.balance, 12.5);
  const refreshes = upstream.calls.filter(call => call.path === '/auth/refresh');
  assert.equal(refreshes.length, 1, 'concurrent 401 responses share the serialized rotation');
  assert.deepEqual(refreshes[0].body, { refresh_token: 'refresh-1' });
  const dataCalls = upstream.calls.filter(call => call.path.startsWith('/usage/') || call.path === '/user/profile');
  assert.ok(dataCalls.some(call => call.accessToken === 'access-1'));
  assert.ok(dataCalls.some(call => call.accessToken === 'access-2'));
  const stored = (await provider.readRecord('relay-dashboard/sites')).payload.profiles['https://sub2api.example'];
  assert.equal(stored.accessToken, 'access-2');
  assert.equal(stored.refreshToken, 'refresh-2');
  assert.equal(dataCalls.find(call => call.path.endsWith('/trend')).query.granularity, 'day');
});

test('proactively refreshes near-expiry access tokens and exposes only the access token', async () => {
  let clock = 1000000;
  const provider = credentials();
  const upstream = upstreamForDashboard({ refreshResult: auth('access-rotated', 'refresh-rotated', 3600) });
  const store = createProfileStore(provider, { request: upstream.request, now: () => clock });
  const login = await store.login({ site: 'https://sub2api.example', email: 'u@example.invalid', password: 'x', mode: 'token' });
  assert.equal(login.accessToken, 'access-1');
  clock += 3600 * 1000;
  const result = await store.accessToken('https://sub2api.example');
  assert.deepEqual(result, { accessToken: 'access-rotated' });
  assert.deepEqual(Object.keys(result), ['accessToken']);
  assert.deepEqual(upstream.calls.filter(call => call.path === '/auth/refresh')[0].body, { refresh_token: 'refresh-1' });
});

test('two-factor login stores the temporary token only on Host and uses the verified request fields', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard({ loginResult: { requires_2fa: true, temp_token: 'private-temp-token' } });
  const store = createProfileStore(provider, { request: upstream.request, now: () => 7000 });
  const pending = await store.login({ site: 'https://sub2api.example', email: 'u@example.invalid', password: 'x', mode: 'token' });
  assert.deepEqual(pending, { requiresTwoFactor: true, mode: 'token' });
  assert.equal(JSON.stringify(pending).includes('private-temp-token'), false);
  assert.equal((await store.list())['https://sub2api.example'].pendingMode, 'token');
  upstream.calls.length = 0;
  const completed = await store.completeTwoFactor({ site: 'https://sub2api.example', totp_code: '123456' });
  assert.deepEqual(completed, { accessToken: 'access-2' });
  assert.deepEqual(upstream.calls[0].body, { temp_token: 'private-temp-token', totp_code: '123456' });
  const record = (await provider.readRecord('relay-dashboard/sites')).payload.profiles['https://sub2api.example'];
  assert.equal(record.pending, undefined);
  assert.equal(record.refreshToken, 'refresh-2');
});

test('rejects insecure login origins before making an upstream request', async () => {
  const upstream = upstreamForDashboard();
  const store = createProfileStore(credentials(), { request: upstream.request });
  await assert.rejects(store.login({ site: 'http://sub2api.example', email: 'u@example.invalid', password: 'x', mode: 'token' }), /HTTPS/);
  await assert.rejects(store.login({ site: 'https://sub2api.example:8443', email: 'u@example.invalid', password: 'x', mode: 'token' }), /HTTPS/);
  assert.equal(upstream.calls.length, 0);
});

test('manual per-site and all-site deletion remove stored session and pending data', async () => {
  const provider = credentials();
  const upstream = upstreamForDashboard();
  const store = createProfileStore(provider, { request: upstream.request, now: () => 1000 });
  await store.login({ site: 'https://a.example', email: 'a@example.invalid', password: 'x', mode: 'token' });
  await store.login({ site: 'https://b.example', email: 'b@example.invalid', password: 'y', mode: 'token' });
  let listing = await store.removeSite('https://a.example');
  assert.deepEqual(Object.keys(listing), ['https://b.example']);
  let profiles = (await provider.readRecord('relay-dashboard/sites')).payload.profiles;
  assert.equal(profiles['https://a.example'], undefined);
  assert.equal(profiles['https://b.example'].refreshToken, 'refresh-1');
  await store.removeAll();
  assert.equal(await provider.readRecord('relay-dashboard/sites'), undefined);
});

test('legacy browser migration preserves server values and returns summaries without credentials', async () => {
  const provider = credentials();
  const store = createProfileStore(provider, { request: upstreamForDashboard().request, now: () => 42 });
  const summaries = await store.importLegacy({
    'https://a.example': { token: 'Bearer "legacy-a"', updatedAt: 4 },
    'https://b.example': { token: 'legacy-b' },
  });
  assert.equal(summaries['https://a.example'].hasRefreshToken, false);
  assert.equal(JSON.stringify(summaries).includes('legacy-a'), false);
  const profiles = (await provider.readRecord('relay-dashboard/sites')).payload.profiles;
  assert.equal(profiles['https://a.example'].accessToken, 'legacy-a');
  assert.equal(profiles['https://b.example'].accessToken, 'legacy-b');
});

test('rejects oversized legacy migration without truncating saved sites', async () => {
  const provider = credentials();
  const store = createProfileStore(provider);
  const profiles = Object.fromEntries(Array.from({ length: 21 }, (_, index) => [
    `https://site-${index}.example`, { token: legacyTokenValue },
  ]));
  await assert.rejects(store.importLegacy(profiles), error => error.status === 413 && error.code === 'too-many-profiles');
  assert.equal(await provider.readRecord('relay-dashboard/sites'), undefined);
});

test('credential provider failures return actionable sanitized route errors', async () => {
  const provider = credentials();
  provider.readRecord = async () => { throw new Error('sensitive-provider-detail'); };
  let route;
  apply({
    credentials: provider,
    connection: { admit: () => ({ peer: { principal: { kind: 'owner' } } }) },
    effect: effect => effect(),
    webServer: { register: value => { route = value; return () => {}; } },
  });
  const req = Readable.from([]);
  req.method = 'GET';
  let body;
  const res = { setHeader() {}, end(value) { body = JSON.parse(value); } };
  await route.handler(req, res);
  assert.equal(res.statusCode, 503);
  assert.equal(body.code, 'credential-storage-read');
  assert.match(body.error, /凭据存储读取失败/);
  assert.equal(JSON.stringify(body).includes('sensitive-provider-detail'), false);
});

test('route enforces owner admission, no-store, size limits, summaries, and deletion', async () => {
  let route, admission = { rejection: 401 };
  const provider = credentials();
  apply({
    credentials: provider,
    connection: { admit: () => admission },
    effect: effect => effect(),
    webServer: { register: value => { route = value; return () => {}; } },
  });
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
  assert.equal((await request('GET')).status, 401);
  admission = { peer: { principal: { kind: 'viewer' } } };
  assert.equal((await request('GET')).status, 403);
  admission = { peer: { principal: { kind: 'owner' } } };
  const imported = await request('POST', JSON.stringify({ action: 'import-legacy', profiles: { 'https://a.example': { token: legacyTokenValue } } }), true);
  assert.equal(imported.status, 200);
  assert.equal(imported.result.profiles['https://a.example'].hasRefreshToken, false);
  assert.equal(JSON.stringify(imported.result).includes(legacyTokenValue), false);
  const manual = await request('POST', JSON.stringify({ action: 'save-token', site: 'https://gateway.example', token: manualTokenValue }), true);
  assert.equal(manual.status, 200, 'the route accepts a manually supplied access Token');
  assert.equal(manual.result.profiles['https://gateway.example'].hasRefreshToken, false, 'the manual Token profile has no refresh credential');
  assert.equal(JSON.stringify(manual.result).includes(manualTokenValue), false, 'the route never echoes the submitted Token');
  const restored = await request('GET');
  assert.deepEqual(Object.keys(restored.result.profiles['https://a.example']).sort(), ['expiresAt', 'hasAccessToken', 'hasRefreshToken', 'needsTwoFactor', 'pendingMode', 'updatedAt', 'verifiedAt']);
  assert.equal(restored.headers['Cache-Control'], 'no-store, private');
  assert.equal(restored.headers.Pragma, 'no-cache');
  assert.equal((await request('POST', '{bad')).status, 400);
  assert.equal((await request('POST', 'x'.repeat(65537))).status, 413);
  assert.equal((await request('DELETE', JSON.stringify({ site: 'https://a.example' }))).result.profiles['https://a.example'], undefined);
  await request('POST', JSON.stringify({ action: 'import-legacy', profiles: { 'https://b.example': { token: secondTokenValue } } }));
  assert.deepEqual((await request('DELETE')).result.profiles, {});
  assert.equal(await provider.readRecord('relay-dashboard/sites'), undefined);
});
