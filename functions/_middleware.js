const BASE = 'https://oauth-pages-lab-ec6.pages.dev';
const encoder = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
const redirect = (path, cookie) => new Response(null, { status: 303, headers: { Location: BASE + path, 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
const random = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
const hash = async value => b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
const cookie = (name, value, age) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const cookies = request => Object.fromEntries((request.headers.get('Cookie') || '').split(';').map(x => x.trim().split('=').slice(0, 2)).filter(x => x.length === 2));
const plain = (message, status = 400) => new Response(message, { status, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });

async function schema(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS oauth_transactions (id_hash TEXT PRIMARY KEY, provider TEXT NOT NULL, state_hash TEXT NOT NULL, nonce TEXT, code_verifier TEXT NOT NULL, expires_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(provider, provider_user_id))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sessions (id_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))')
  ]);
}
function config(env, provider) {
  const client = provider === 'google' ? env.GOOGLE_CLIENT_ID : env.GITHUB_CLIENT_ID;
  const secret = provider === 'google' ? env.GOOGLE_CLIENT_SECRET : env.GITHUB_CLIENT_SECRET;
  if (!env.DB || !client || !secret || env.PUBLIC_BASE_URL !== BASE) throw new Error('Configuração de autenticação incompleta');
  return { client, secret, callback: `${BASE}/oauth/callback/${provider}` };
}
async function start(request, env, provider) {
  const { client, callback } = config(env, provider);
  await schema(env.DB);
  const transaction = random(), state = random(), verifier = random(), nonce = random();
  await env.DB.prepare('INSERT INTO oauth_transactions (id_hash,provider,state_hash,nonce,code_verifier,expires_at) VALUES (?,?,?,?,?,?)')
    .bind(await hash(transaction), provider, await hash(state), provider === 'google' ? nonce : null, verifier, now() + 600).run();
  const challenge = await hash(verifier);
  const url = new URL(provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : 'https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', client);
  url.searchParams.set('redirect_uri', callback);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (provider === 'google') { url.searchParams.set('scope', 'openid email profile'); url.searchParams.set('nonce', nonce); }
  return new Response(null, { status: 302, headers: { Location: url.toString(), 'Set-Cookie': cookie('oauth_tx', transaction, 600), 'Cache-Control': 'no-store' } });
}
async function exchange(provider, cfg, code, verifier) {
  const params = new URLSearchParams({ client_id: cfg.client, client_secret: cfg.secret, code, redirect_uri: cfg.callback, code_verifier: verifier, grant_type: 'authorization_code' });
  const response = await fetch(provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: params
  });
  if (!response.ok) throw new Error('Falha na troca do código');
  const data = await response.json();
  if (data.error) throw new Error('Código rejeitado pelo provedor');
  return data;
}
async function googleIdentity(token, client, nonce) {
  if (typeof token !== 'string') throw new Error('Token de identidade ausente');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token inválido');
  const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
  if (header.alg !== 'RS256' || !header.kid || !['https://accounts.google.com', 'accounts.google.com'].includes(claims.iss) || claims.aud !== client || claims.nonce !== nonce || !claims.sub || !claims.exp || claims.exp <= now() || !claims.iat || claims.iat > now() + 60 || claims.email_verified !== true) throw new Error('Identidade Google inválida');
  const keysResponse = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!keysResponse.ok) throw new Error('Chaves Google indisponíveis');
  const { keys } = await keysResponse.json();
  const jwk = keys.find(k => k.kid === header.kid && k.kty === 'RSA' && k.use === 'sig');
  if (!jwk) throw new Error('Chave Google desconhecida');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`))) throw new Error('Assinatura Google inválida');
  return { id: String(claims.sub), name: claims.name || claims.email, email: claims.email };
}
async function githubIdentity(token, cfg) {
  if (!token) throw new Error('Token GitHub ausente');
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'oauth-pages-lab' };
  try {
    const response = await fetch('https://api.github.com/user', { headers });
    if (!response.ok) throw new Error('Perfil GitHub indisponível');
    const profile = await response.json();
    if (!Number.isSafeInteger(profile.id)) throw new Error('ID GitHub inválido');
    return { id: String(profile.id), name: profile.name || profile.login, email: profile.email || null };
  } finally {
    await fetch(`https://api.github.com/applications/${encodeURIComponent(cfg.client)}/grant`, {
      method: 'DELETE', headers: { Authorization: `Basic ${btoa(`${cfg.client}:${cfg.secret}`)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'oauth-pages-lab', 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: token })
    }).catch(() => {});
  }
}
async function callback(request, env, provider) {
  const cfg = config(env, provider);
  const url = new URL(request.url), code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const tx = cookies(request).oauth_tx;
  if (url.searchParams.has('error') || !code || !state || !tx) return plain('Autenticação cancelada ou transação inválida');
  await schema(env.DB);
  const record = await env.DB.prepare('SELECT * FROM oauth_transactions WHERE id_hash=?').bind(await hash(tx)).first();
  if (!record || record.provider !== provider || record.expires_at <= now() || record.state_hash !== await hash(state)) return plain('Transação expirada ou inválida');
  await env.DB.prepare('DELETE FROM oauth_transactions WHERE id_hash=?').bind(await hash(tx)).run();
  const tokens = await exchange(provider, cfg, code, record.code_verifier);
  const identity = provider === 'google' ? await googleIdentity(tokens.id_token, cfg.client, record.nonce) : await githubIdentity(tokens.access_token, cfg);
  await env.DB.prepare('INSERT INTO users (name,email,provider,provider_user_id,created_at) VALUES (?,?,?,?,?) ON CONFLICT(provider,provider_user_id) DO UPDATE SET name=excluded.name,email=excluded.email')
    .bind(identity.name, identity.email, provider, identity.id, now()).run();
  const user = await env.DB.prepare('SELECT id FROM users WHERE provider=? AND provider_user_id=?').bind(provider, identity.id).first();
  const session = random();
  await env.DB.prepare('INSERT INTO sessions (id_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(await hash(session), user.id, now() + 604800, now()).run();
  return redirect('/', cookie('session', session, 604800));
}
async function me(request, env) {
  if (!env.DB) return json({ error: 'D1 não configurado' }, 503);
  const session = cookies(request).session;
  if (!session) return json({ authenticated: false }, 401);
  await schema(env.DB);
  const user = await env.DB.prepare('SELECT u.id,u.name,u.email,u.provider,u.provider_user_id,u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id_hash=? AND s.expires_at>?').bind(await hash(session), now()).first();
  return user ? json({ authenticated: true, user }) : json({ authenticated: false }, 401);
}
async function logout(request, env) {
  if (request.headers.get('Origin') !== BASE) return plain('Origem inválida', 403);
  const session = cookies(request).session;
  if (session && env.DB) await env.DB.prepare('DELETE FROM sessions WHERE id_hash=?').bind(await hash(session)).run();
  return redirect('/', cookie('session', '', 0));
}
export async function onRequest(context) {
  const { request, env } = context;
  const path = new URL(request.url).pathname;
  try {
    if (path === '/api/me' && request.method === 'GET') return await me(request, env);
    if (path === '/oauth/logout' && request.method === 'POST') return await logout(request, env);
    const login = path.match(/^\/oauth\/login\/(google|github)$/);
    if (login && request.method === 'GET') return await start(request, env, login[1]);
    const cb = path.match(/^\/oauth\/callback\/(google|github)$/);
    if (cb && request.method === 'GET') return await callback(request, env, cb[1]);
    if (path.startsWith('/oauth/') || path === '/api/me') return plain('Rota não encontrada', 404);
    return context.next();
  } catch (error) {
    console.error('Falha de autenticação:', error.message);
    return plain('Não foi possível concluir a autenticação. Verifique a configuração e tente novamente.', 503);
  }
}
