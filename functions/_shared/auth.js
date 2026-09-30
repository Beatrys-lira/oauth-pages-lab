import { now, random, hash } from './crypto.js';
import { cookie, cookies } from './cookies.js';
import { BASE, config, exchange, githubIdentity } from './providers.js';
import { googleIdentity } from './oidc.js';

const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
const redirect = (path, cookie) => new Response(null, { status: 303, headers: { Location: BASE + path, 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
export const plain = (message, status = 400) => new Response(message, { status, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });

async function schema(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS oauth_transactions (id_hash TEXT PRIMARY KEY, provider TEXT NOT NULL, state_hash TEXT NOT NULL, nonce TEXT, code_verifier TEXT NOT NULL, expires_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(provider, provider_user_id))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sessions (id_hash TEXT PRIMARY KEY, issuer TEXT NOT NULL, subject TEXT NOT NULL, email TEXT, display_name TEXT, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS user_profiles (user_id INTEGER PRIMARY KEY REFERENCES users(id), picture TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS oauth_transactions_expiry ON oauth_transactions (expires_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires_at)')
  ]);
}
export async function start(request, env, provider) {
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
  return new Response(null, { status: 302, headers: { Location: url.toString(), 'Set-Cookie': cookie('__Host-oauth-tx', transaction, 600, 'Lax'), 'Cache-Control': 'no-store' } });
}
async function authStep(code, action) {
  try { return await action(); }
  catch (error) { error.authStage = code; throw error; }
}
export async function callback(request, env, provider) {
  const cfg = config(env, provider);
  const url = new URL(request.url), code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const tx = cookies(request)['__Host-oauth-tx'];
  if (url.searchParams.has('error') || !code || !state || !tx) return plain('Autenticação cancelada ou transação inválida');
  await authStep('D1_TABELAS', () => schema(env.DB));
  const txHash = await hash(tx);
  const record = await authStep('D1_TRANSACAO', () => env.DB.prepare('SELECT * FROM oauth_transactions WHERE id_hash=?').bind(txHash).first());
  if (!record || record.provider !== provider || record.expires_at <= now() || record.state_hash !== await hash(state)) return plain('Transação expirada ou inválida');
  await authStep('D1_EXCLUIR_TRANSACAO', () => env.DB.prepare('DELETE FROM oauth_transactions WHERE id_hash=?').bind(txHash).run());
  const tokens = await authStep('TROCA_CODIGO', () => exchange(provider, cfg, code, record.code_verifier));
  const identity = await authStep('IDENTIDADE', () => provider === 'google' ? googleIdentity(tokens.id_token, cfg.client, record.nonce) : githubIdentity(tokens.access_token, cfg));
  await authStep('D1_USUARIO', () => env.DB.prepare('INSERT INTO users (name,email,provider,provider_user_id,created_at) VALUES (?,?,?,?,?) ON CONFLICT(provider,provider_user_id) DO UPDATE SET name=excluded.name,email=excluded.email')
    .bind(identity.name, identity.email, provider, identity.id, now()).run());
  const user = await authStep('D1_CONSULTAR_USUARIO', () => env.DB.prepare('SELECT id FROM users WHERE provider=? AND provider_user_id=?').bind(provider, identity.id).first());
  await authStep('D1_PERFIL', () => env.DB.prepare('INSERT INTO user_profiles (user_id,picture) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET picture=excluded.picture')
    .bind(user.id, identity.picture || null).run());
  const session = random(), sessionHash = await hash(session);
  const issuer = provider === 'google' ? 'https://accounts.google.com' : 'https://github.com';
  await authStep('D1_SESSAO', () => env.DB.prepare('INSERT INTO sessions (id_hash,issuer,subject,email,display_name,expires_at,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(sessionHash, issuer, identity.id, identity.email, identity.name, now() + 28800, now()).run());
  return redirect('/dashboard.html', cookie('__Host-session', session, 28800));
}

export async function me(request, env) {
  if (!env.DB) return json({ error: 'D1 não configurado' }, 503);
  const session = cookies(request)['__Host-session'];
  if (!session) return json({ authenticated: false }, 401);
  await schema(env.DB);
  const user = await env.DB.prepare("SELECT u.id,u.name,u.email,u.provider,u.provider_user_id,u.created_at,p.picture FROM sessions s JOIN users u ON u.provider_user_id=s.subject AND ((s.issuer='https://accounts.google.com' AND u.provider='google') OR (s.issuer='https://github.com' AND u.provider='github')) LEFT JOIN user_profiles p ON p.user_id=u.id WHERE s.id_hash=? AND s.expires_at>?").bind(await hash(session), now()).first();
  return user ? json({ authenticated: true, user }) : json({ authenticated: false }, 401);
}
export async function logout(request, env) {
  if (request.headers.get('Origin') !== BASE) return plain('Origem inválida', 403);
  const session = cookies(request)['__Host-session'];
  if (session && env.DB) await env.DB.prepare('DELETE FROM sessions WHERE id_hash=?').bind(await hash(session)).run();
  return redirect('/', cookie('__Host-session', '', 0));
}

export async function handle(action) {
  try {
    return await action();
  } catch (error) {
    console.error('Falha de autenticação:', error.message);
    return plain(`Não foi possível concluir a autenticação. Código: ${error.authStage || 'GERAL'}.`, 503);
  }
}
