import { lookup } from 'node:dns/promises';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';

export const inject = ['credentials', 'webServer', 'connection'];
const RECORD = 'relay-dashboard/sites';
const PATH = '/relay-dashboard/profiles';
const MAX_BODY_BYTES = 65536;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 20000;
const MANUAL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const API_PATHS = new Set([
  '/auth/login', '/auth/login/2fa', '/auth/refresh',
  '/user/profile', '/usage/dashboard/stats', '/usage/dashboard/trend', '/usage/dashboard/models',
]);

const blockedAddresses = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blockedAddresses.addSubnet(network, prefix, 'ipv4');
for (const [network, prefix] of [
  ['::', 128], ['::1', 128], ['64:ff9b:1::', 48], ['100::', 64],
  ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
]) blockedAddresses.addSubnet(network, prefix, 'ipv6');

export class PluginError extends Error {
  constructor(message, status = 400, code = 'invalid-request') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function normalizeSite(value) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch { throw new PluginError('请输入有效的中转站网址'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname) {
    throw new PluginError('请输入有效的 HTTP(S) 中转站网址');
  }
  return url.origin;
}

function requireSecureSite(value) {
  const site = normalizeSite(value);
  const url = new URL(site);
  if (url.protocol !== 'https:' || (url.port && url.port !== '443')) {
    throw new PluginError('登录和凭据续期仅允许标准 HTTPS 端口', 400, 'unsafe-origin');
  }
  return site;
}

export function normalizeToken(value) {
  return String(value || '').trim().replace(/^['"‘’“”]+|['"‘’“”]+$/g, '').replace(/^Bearer\s+/i, '').trim().replace(/^['"‘’“”]+|['"‘’“”]+$/g, '').trim();
}

export function publicAddress(address, family) {
  const version = family || isIP(address);
  if ((version !== 4 && version !== 6) || (version === 6 && address.toLowerCase().startsWith('::ffff:'))) return false;
  return !blockedAddresses.check(address, version === 4 ? 'ipv4' : 'ipv6');
}

async function resolvePublicAddress(hostname) {
  const host = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
  const family = isIP(host);
  const addresses = family ? [{ address: host, family }] : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(entry => !publicAddress(entry.address, entry.family))) {
    throw new PluginError('为保护服务器安全，只能连接解析到公网地址的 HTTPS 中转站', 400, 'unsafe-origin');
  }
  return addresses[0];
}

async function httpsJson(site, path, { method = 'GET', body, accessToken, query } = {}) {
  const origin = new URL(requireSecureSite(site));
  if (!API_PATHS.has(path)) throw new PluginError('不支持的中转站接口');
  let address;
  try { address = await resolvePublicAddress(origin.hostname); }
  catch (error) {
    if (error instanceof PluginError) throw error;
    throw new PluginError('无法解析中转站域名', 502, 'upstream-unreachable');
  }
  const requestUrl = new URL(origin);
  requestUrl.pathname = `/api/v1${path}`;
  if (query) requestUrl.search = new URLSearchParams(query).toString();
  const bodyBytes = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
  if (bodyBytes && bodyBytes.length > MAX_BODY_BYTES) throw new PluginError('登录请求内容过大', 413, 'body-too-large');
  const hostname = origin.hostname.startsWith('[') ? origin.hostname.slice(1, -1) : origin.hostname;

  return new Promise((resolve, reject) => {
    let failed = false;
    const fail = error => {
      if (failed) return;
      failed = true;
      reject(error);
    };
    const request = https.request({
      protocol: 'https:', hostname, port: origin.port || 443,
      servername: isIP(hostname) ? undefined : hostname,
      method, path: `${requestUrl.pathname}${requestUrl.search}`,
      lookup: (_hostname, options, callback) => {
        const result = { address: address.address, family: address.family };
        if (options?.all) callback(null, [result]);
        else callback(null, result.address, result.family);
      },
      headers: {
        Accept: 'application/json',
        ...(bodyBytes ? { 'Content-Type': 'application/json', 'Content-Length': bodyBytes.length } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }, response => {
      const chunks = [];
      let size = 0;
      response.on('data', chunk => {
        if (failed) return;
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) {
          fail(new PluginError('中转站响应内容过大', 502, 'response-too-large'));
          request.destroy();
          return;
        }
        chunks.push(chunk);
      });
      response.on('error', () => fail(new PluginError('中转站响应中断', 502, 'upstream-unreachable')));
      response.on('end', () => {
        if (failed) return;
        try {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: response.statusCode || 502, payload: text ? JSON.parse(text) : null });
        } catch {
          fail(new PluginError('中转站返回了无效响应', 502, 'invalid-upstream-response'));
        }
      });
    });
    request.setTimeout(REQUEST_TIMEOUT_MS, () => request.destroy());
    request.on('error', () => fail(new PluginError('无法安全连接中转站，请检查 HTTPS、网络和域名解析', 502, 'upstream-unreachable')));
    if (bodyBytes) request.write(bodyBytes);
    request.end();
  });
}

function payloadFrom(response) {
  const { status, payload } = response;
  if (status < 200 || status >= 300) throw new PluginError('中转站拒绝了请求', status, 'upstream-rejected');
  if (payload && Object.hasOwn(payload, 'code') && payload.code !== 0) {
    const status = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503].includes(Number(payload.code)) ? Number(payload.code) : 400;
    throw new PluginError('中转站未接受该请求', status, 'upstream-rejected');
  }
  return payload && Object.hasOwn(payload, 'data') ? payload.data : payload;
}

function profilesFromRecord(record) {
  if (record === undefined) return {};
  const payload = record?.kind === 'grant' ? record.payload : undefined;
  if (![1, 2].includes(payload?.version) || !payload.profiles || Array.isArray(payload.profiles)) {
    throw new PluginError('服务器凭据存储格式异常', 500, 'invalid-store');
  }
  const profiles = {};
  for (const [rawSite, raw] of Object.entries(payload.profiles)) {
    const site = normalizeSite(rawSite);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    profiles[site] = {
      accessToken: normalizeToken(raw.accessToken ?? raw.token),
      refreshToken: normalizeToken(raw.refreshToken),
      expiresAt: Number.isFinite(Number(raw.expiresAt)) && Number(raw.expiresAt) > 0 ? Number(raw.expiresAt) : 0,
      updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : 0,
      ...(Number.isFinite(Number(raw.verifiedAt)) && Number(raw.verifiedAt) > 0 ? { verifiedAt: Number(raw.verifiedAt) } : {}),
      pending: typeof raw.pending?.tempToken === 'string' ? {
        tempToken: raw.pending.tempToken,
        mode: raw.pending.mode === 'token' ? 'token' : 'dashboard',
        range: ['7', '30', '90'].includes(String(raw.pending.range)) ? Number(raw.pending.range) : 7,
      } : undefined,
    };
  }
  return profiles;
}

function makeRecord(profiles) {
  // The credential provider rejects undefined at any depth; omit optional fields.
  return { kind: 'grant', payload: JSON.parse(JSON.stringify({ version: 2, profiles })) };
}

function validateMode(mode) {
  if (mode !== 'dashboard' && mode !== 'token') throw new PluginError('请选择获取仪表盘数据或仅获取访问 Token');
  return mode;
}

function validateToken(value, label) {
  const token = normalizeToken(value);
  if (!token || token.length > 32768 || /[\r\n]/.test(token)) throw new PluginError(`${label}格式无效`);
  return token;
}

function authPairFrom(value, timestamp = Date.now()) {
  const accessToken = validateToken(value?.access_token, '访问 Token');
  const refreshToken = value?.refresh_token ? validateToken(value.refresh_token, 'Refresh Token') : '';
  const seconds = Number(value?.expires_in);
  return {
    accessToken,
    refreshToken,
    expiresAt: Number.isFinite(seconds) && seconds > 0 ? timestamp + seconds * 1000 : 0,
    updatedAt: timestamp,
    pending: undefined,
  };
}

function mapGatewayError(error, operation) {
  if (error instanceof PluginError) {
    if (error.code === 'upstream-unreachable' || error.code === 'unsafe-origin' || error.code === 'body-too-large' || error.code === 'invalid-store') return error;
    if (operation === 'login' && error.status === 401) return new PluginError('登录失败，请检查账号和密码', 401, 'login-rejected');
    if (operation === 'login' && error.status === 403) return new PluginError('此站点要求额外的人机验证；请在站点官方页面完成验证，再使用官方提供的访问 Token 登录。本插件不会生成或绕过验证结果', 403, 'login-challenge');
    if (operation === 'login' && error.status === 429) return new PluginError('登录尝试过于频繁，请稍后重试', 429, 'rate-limited');
  }
  return error;
}

function summarizeProfiles(profiles) {
  return Object.fromEntries(Object.entries(profiles).map(([site, profile]) => [site, {
    updatedAt: profile.updatedAt,
    expiresAt: profile.expiresAt || 0,
    hasAccessToken: Boolean(profile.accessToken),
    hasRefreshToken: Boolean(profile.refreshToken),
    verifiedAt: profile.verifiedAt || 0,
    needsTwoFactor: Boolean(profile.pending?.tempToken),
    pendingMode: profile.pending?.mode || '',
  }]));
}

function dateParams(input = {}) {
  const allowedRanges = new Set(['7', '30', '90']);
  const range = allowedRanges.has(String(input.range)) ? Number(input.range) : 7;
  const end = new Date();
  const start = new Date(end.getTime() - (range - 1) * 86400000);
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    granularity: 'day',
  };
}

function fields(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(names.filter(name => value[name] !== undefined).map(name => [name, value[name]]));
}

function listFrom(value, key) {
  const list = Array.isArray(value) ? value : value?.[key];
  return Array.isArray(list) ? list : [];
}

function dashboardPayload(responses) {
  const [profile, stats, trend, models] = responses;
  const platformFields = ['platform', 'total_actual_cost', 'total_cost', 'today_actual_cost', 'today_cost', 'total_requests', 'total_tokens'];
  return {
    profile: fields(profile, ['balance', 'available_balance', 'credit']),
    stats: {
      ...fields(stats, [
        'total_api_keys', 'active_api_keys', 'today_requests', 'requests_today', 'total_requests',
        'today_actual_cost', 'today_cost', 'total_actual_cost', 'total_cost', 'today_tokens', 'total_tokens',
        'today_input_tokens', 'today_output_tokens', 'rpm', 'tpm', 'avg_response_time', 'average_response_time',
      ]),
      by_platform: listFrom(stats, 'by_platform').map(item => fields(item, platformFields)),
    },
    trend: listFrom(trend, 'trend').map(item => fields(item, ['date', 'day', 'label', 'total_tokens', 'tokens'])),
    models: listFrom(models, 'models').map(item => fields(item, ['model', 'name', 'total_tokens', 'tokens', 'total_requests', 'requests'])),
  };
}

export function createProfileStore(credentials, { request = httpsJson, now = Date.now } = {}) {
  const credentialStorageError = (stage, label, cause) => {
    const code = typeof cause?.code === 'string' && /^[A-Z][A-Z0-9_]{1,31}$/.test(cause.code) ? cause.code : '';
    const name = typeof cause?.name === 'string' && /^[A-Za-z]{1,40}Error$/.test(cause.name) ? cause.name : '';
    const diagnostic = code || name;
    return new PluginError(`DSH 凭据存储${label}失败，请检查 Host 凭据提供器状态${diagnostic ? `（${diagnostic}）` : ''}`, 503, `credential-storage-${stage}`);
  };
  const readRecord = async () => {
    try { return await credentials.readRecord(RECORD); }
    catch (error) { if (error instanceof PluginError) throw error; throw credentialStorageError('read', '读取', error); }
  };
  const modifyRecord = async mutate => {
    try {
      return await credentials.modifyRecord(RECORD, async current => {
        try { return await mutate(current); }
        catch (error) {
          if (error instanceof PluginError) throw error;
          throw new PluginError('中转站请求处理失败', 500, 'operation-failed');
        }
      });
    } catch (error) { if (error instanceof PluginError) throw error; throw credentialStorageError('write', '写入', error); }
  };
  const deleteRecord = async () => {
    try { return await credentials.deleteRecord(RECORD); }
    catch (error) { if (error instanceof PluginError) throw error; throw credentialStorageError('delete', '删除', error); }
  };
  const read = async () => profilesFromRecord(await readRecord());
  const writeSite = async (site, update) => modifyRecord(async current => {
    const profiles = profilesFromRecord(current);
    profiles[site] = update(profiles[site] || {});
    return makeRecord(profiles);
  });
  const markDashboardVerified = async (site, usedTokens) => modifyRecord(async current => {
    const profiles = profilesFromRecord(current);
    if (!profiles[site]?.accessToken || !usedTokens.includes(profiles[site].accessToken)) return undefined;
    profiles[site] = { ...profiles[site], verifiedAt: now() };
    return makeRecord(profiles);
  });

  async function refreshWithinLock(site, failedAccessToken = '') {
    let selected;
    await modifyRecord(async current => {
      const profiles = profilesFromRecord(current);
      const saved = profiles[site];
      if (!saved?.accessToken) throw new PluginError('该站点尚未登录，请重新登录', 401, 'reauth-required');
      if (failedAccessToken && saved.accessToken !== failedAccessToken) {
        selected = saved;
        return undefined;
      }
      if (!saved.refreshToken) {
        if (failedAccessToken || (saved.expiresAt && saved.expiresAt <= now())) {
          throw new PluginError('登录已过期，请重新登录', 401, 'reauth-required');
        }
        selected = saved;
        return undefined;
      }
      let result;
      try {
        result = payloadFrom(await request(site, '/auth/refresh', {
          method: 'POST', body: { refresh_token: saved.refreshToken },
        }));
      } catch (error) {
        if (error instanceof PluginError && error.code === 'upstream-rejected' && [400, 401].includes(error.status)) {
          throw new PluginError('刷新凭据已失效，请重新登录', 401, 'reauth-required');
        }
        throw error;
      }
      const refreshed = authPairFrom(result, now());
      if (!refreshed.refreshToken) throw new PluginError('未能续期，请重新登录', 401, 'reauth-required');
      if (saved.verifiedAt) refreshed.verifiedAt = saved.verifiedAt;
      profiles[site] = refreshed;
      selected = refreshed;
      return makeRecord(profiles);
    });
    if (!selected?.accessToken) throw new PluginError('登录状态不可用，请重新登录', 401, 'reauth-required');
    return selected;
  }

  async function usableSession(site, failedAccessToken = '') {
    const profiles = await read();
    const saved = profiles[site];
    if (!saved?.accessToken) throw new PluginError('该站点尚未登录，请重新登录', 401, 'reauth-required');
    const nearExpiry = saved.expiresAt > 0 && saved.expiresAt <= now() + 60000;
    if (failedAccessToken || nearExpiry) return refreshWithinLock(site, failedAccessToken || saved.accessToken);
    if (saved.expiresAt && saved.expiresAt <= now() && !saved.refreshToken) {
      throw new PluginError('登录已过期，请重新登录', 401, 'reauth-required');
    }
    return saved;
  }

  async function withAuthRetry(site, path, query, saved) {
    try {
      return { data: payloadFrom(await request(site, path, { accessToken: saved.accessToken, query })), accessToken: saved.accessToken };
    } catch (error) {
      if (!(error instanceof PluginError) || error.status !== 401) throw error;
      const refreshed = await usableSession(site, saved.accessToken);
      try {
        return { data: payloadFrom(await request(site, path, { accessToken: refreshed.accessToken, query })), accessToken: refreshed.accessToken };
      } catch (retryError) {
        if (retryError instanceof PluginError && retryError.status === 401) {
          throw new PluginError('登录已过期，请重新登录', 401, 'reauth-required');
        }
        throw retryError;
      }
    }
  }

  async function dashboard(siteValue, range) {
    const site = normalizeSite(siteValue);
    const saved = await usableSession(site);
    const query = dateParams({ range });
    const paths = ['/user/profile', '/usage/dashboard/stats', '/usage/dashboard/trend', '/usage/dashboard/models'];
    const responses = await Promise.all(paths.map(path => withAuthRetry(site, path, path.endsWith('/trend') || path.endsWith('/models') ? query : undefined, saved)));
    await markDashboardVerified(site, [...new Set(responses.map(response => response.accessToken))]);
    return dashboardPayload(responses.map(response => response.data));
  }

  async function finishAuthentication(site, mode, authData, range = 7) {
    const pair = authPairFrom(authData, now());
    await writeSite(site, () => pair);
    if (mode === 'token') return { accessToken: pair.accessToken };
    return { dashboard: await dashboard(site, range) };
  }

  async function login(input) {
    const site = requireSecureSite(input.site);
    const mode = validateMode(input.mode);
    const range = ['7', '30', '90'].includes(String(input.range)) ? Number(input.range) : 7;
    const email = String(input.email || '').trim();
    const password = String(input.password || '');
    if (!email || email.length > 320 || !password || password.length > 4096 || /[\r\n]/.test(password)) {
      throw new PluginError('请输入有效的邮箱和密码');
    }
    const body = { email, password };
    for (const name of ['turnstile_token', 'tencent_captcha_ticket', 'tencent_captcha_randstr']) {
      if (typeof input[name] === 'string' && input[name]) body[name] = input[name];
    }
    let result;
    try { result = payloadFrom(await request(site, '/auth/login', { method: 'POST', body })); }
    catch (error) { throw mapGatewayError(error, 'login'); }
    if (result?.requires_2fa === true && typeof result.temp_token === 'string' && result.temp_token) {
      await writeSite(site, old => ({ ...old, pending: { tempToken: result.temp_token, mode, range }, updatedAt: now() }));
      return { requiresTwoFactor: true, mode };
    }
    return finishAuthentication(site, mode, result, range);
  }

  async function completeTwoFactor(input) {
    const site = normalizeSite(input.site);
    const code = String(input.totp_code || '').trim();
    if (!/^\d{6}$/.test(code)) throw new PluginError('请输入 6 位验证器代码');
    const profiles = await read();
    const pending = profiles[site]?.pending;
    if (!pending?.tempToken) throw new PluginError('登录验证已失效，请重新登录', 401, 'reauth-required');
    let result;
    try {
      result = payloadFrom(await request(site, '/auth/login/2fa', {
        method: 'POST', body: { temp_token: pending.tempToken, totp_code: code },
      }));
    } catch (error) { throw mapGatewayError(error, 'login'); }
    return finishAuthentication(site, pending.mode, result, pending.range);
  }

  async function accessToken(siteValue) {
    const site = normalizeSite(siteValue);
    const saved = await usableSession(site);
    return { accessToken: saved.accessToken };
  }

  async function saveToken(siteValue, rawToken) {
    const site = requireSecureSite(siteValue);
    const token = validateToken(rawToken, '访问 Token');
    const savedAt = now();
    await writeSite(site, () => ({ accessToken: token, refreshToken: '', expiresAt: savedAt + MANUAL_TOKEN_TTL_MS, updatedAt: savedAt }));
    return summarizeProfiles(await read());
  }

  async function importLegacy(inputProfiles) {
    if (!inputProfiles || typeof inputProfiles !== 'object' || Array.isArray(inputProfiles)) throw new PluginError('旧版站点数据格式无效');
    const entries = Object.entries(inputProfiles);
    if (entries.length > 20) throw new PluginError('每次最多迁移 20 个站点', 413, 'too-many-profiles');
    await modifyRecord(async current => {
      const profiles = profilesFromRecord(current);
      for (const [rawSite, raw] of entries) {
        const site = normalizeSite(rawSite);
        if (profiles[site]?.accessToken) continue;
        const token = validateToken(raw?.token, '旧版访问 Token');
        profiles[site] = { accessToken: token, refreshToken: '', expiresAt: 0, updatedAt: now() };
      }
      return makeRecord(profiles);
    });
    return summarizeProfiles(await read());
  }

  async function removeSite(siteValue) {
    const site = normalizeSite(siteValue);
    await modifyRecord(async current => {
      const profiles = profilesFromRecord(current);
      if (!Object.hasOwn(profiles, site)) return undefined;
      delete profiles[site];
      return makeRecord(profiles);
    });
    return summarizeProfiles(await read());
  }

  return {
    async list() { return summarizeProfiles(await read()); },
    login,
    completeTwoFactor,
    dashboard,
    accessToken,
    saveToken,
    importLegacy,
    removeSite,
    async cancelPending(siteValue) {
      const site = normalizeSite(siteValue);
      await modifyRecord(async current => {
        const profiles = profilesFromRecord(current);
        if (!profiles[site]?.pending) return undefined;
        const { pending, ...saved } = profiles[site];
        profiles[site] = saved;
        return makeRecord(profiles);
      });
      return summarizeProfiles(await read());
    },
    async removeAll() { await deleteRecord(); },
  };
}

async function readBody(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw new PluginError('请求内容过大', 413, 'body-too-large');
    chunks.push(chunk);
  }
  if (!bytes) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new PluginError('请求内容无效'); }
}

function publicError(error) {
  if (error instanceof PluginError) return { status: error.status, body: { error: error.message, code: error.code } };
  const diagnostic = typeof error?.name === 'string' && /^[A-Za-z]{1,40}Error$/.test(error.name) ? error.name : 'Error';
  return { status: 500, body: { error: '服务器凭据或中转站请求失败', code: 'internal-error', diagnostic } };
}

export function apply(ctx) {
  const store = createProfileStore(ctx.credentials);
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: PATH,
    async handler(req, res) {
      const admitted = ctx.connection.admit(req);
      res.setHeader('Cache-Control', 'no-store, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
      if ('rejection' in admitted) return send(admitted.rejection, { error: '登录已失效', code: 'host-auth-required' });
      if (admitted.peer.principal.kind !== 'owner') return send(403, { error: '需要服务器所有者权限', code: 'owner-required' });
      try {
        if (req.method === 'GET') return send(200, { profiles: await store.list() });
        if (req.method === 'DELETE') {
          const input = await readBody(req);
          if (input.site) return send(200, { profiles: await store.removeSite(input.site) });
          await store.removeAll();
          return send(200, { profiles: {} });
        }
        if (req.method !== 'POST') return send(405, { error: '不支持的请求方法', code: 'method-not-allowed' });
        const input = await readBody(req);
        if (input.action === 'login') {
          const result = await store.login(input);
          if (result.requiresTwoFactor) return send(200, result);
          if (Object.hasOwn(result, 'accessToken')) return send(200, result);
          return send(200, { dashboard: result.dashboard, profiles: await store.list() });
        }
        if (input.action === 'complete-two-factor') {
          const result = await store.completeTwoFactor(input);
          if (Object.hasOwn(result, 'accessToken')) return send(200, result);
          return send(200, { dashboard: result.dashboard, profiles: await store.list() });
        }
        if (input.action === 'dashboard') {
          const dashboard = await store.dashboard(input.site, input.range);
          return send(200, { dashboard, profiles: await store.list() });
        }
        if (input.action === 'token') return send(200, await store.accessToken(input.site));
        if (input.action === 'save-token') return send(200, { profiles: await store.saveToken(input.site, input.token) });
        if (input.action === 'import-legacy') return send(200, { profiles: await store.importLegacy(input.profiles) });
        if (input.action === 'cancel-pending') return send(200, { profiles: await store.cancelPending(input.site) });
        return send(400, { error: '不支持的操作', code: 'invalid-action' });
      } catch (error) {
        const result = publicError(error);
        return send(result.status, result.body);
      }
    },
  }));
}
