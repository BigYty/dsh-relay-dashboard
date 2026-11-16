export const inject = ['credentials', 'webServer', 'connection'];
const RECORD = 'relay-dashboard/sites';
const PATH = '/relay-dashboard/profiles';

export function normalizeSite(value) {
  const url = new URL(String(value || '').trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('请输入有效的 HTTP(S) 站点网址');
  return url.origin;
}

export function normalizeToken(value) {
  return String(value || '').trim().replace(/^["'‘’“”]+|["'‘’“”]+$/g, '').replace(/^Bearer\s+/i, '').trim().replace(/^["'‘’“”]+|["'‘’“”]+$/g, '').trim();
}

function profilesFromRecord(record) {
  if (record === undefined) return {};
  if (record.kind !== 'grant' || record.payload?.version !== 1 || !record.payload.profiles || Array.isArray(record.payload.profiles)) throw new Error('服务器站点存储格式异常');
  return record.payload.profiles;
}

export function createProfileStore(credentials) {
  const read = async () => profilesFromRecord(await credentials.readRecord(RECORD));
  return {
    read,
    async save(input, preserveExisting = false) {
      const site = normalizeSite(input.site);
      const token = normalizeToken(input.token);
      if (!token || token.length > 32768 || /[\r\n]/.test(token)) throw new Error('Token 为空或格式无效');
      await credentials.modifyRecord(RECORD, async current => {
        const profiles = profilesFromRecord(current);
        if (preserveExisting && profiles[site]) return undefined;
        return { kind: 'grant', payload: { version: 1, profiles: { ...profiles, [site]: { token, updatedAt: Date.now() } } } };
      });
      return read();
    },
  };
}

export function apply(ctx) {
  const store = createProfileStore(ctx.credentials);
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: PATH,
    async handler(req, res) {
      const admitted = ctx.connection.admit(req);
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
      if ('rejection' in admitted) return send(admitted.rejection, { error: '登录已失效' });
      if (admitted.peer.principal.kind !== 'owner') return send(403, { error: '需要服务器所有者权限' });
      try {
        if (req.method === 'GET') return send(200, { profiles: await store.read() });
        if (req.method !== 'POST') return send(405, { error: '不支持的请求方法' });
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 65536) return send(413, { error: '保存内容过大' });
          chunks.push(chunk);
        }
        const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const profiles = await store.save(input, input.migrate === true);
        return send(200, { profiles });
      } catch {
        return send(400, { error: '站点或 Token 无效，或服务器凭据存储写入失败' });
      }
    },
  }));
}
