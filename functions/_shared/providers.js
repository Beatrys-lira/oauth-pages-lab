export const BASE = 'https://oauth-pages-lab-ec6.pages.dev';

export function config(env, provider) {
  const client = provider === 'google' ? env.GOOGLE_CLIENT_ID : env.GITHUB_CLIENT_ID;
  const secret = provider === 'google' ? env.GOOGLE_CLIENT_SECRET : env.GITHUB_CLIENT_SECRET;
  if (!env.DB || !client || !secret || env.PUBLIC_BASE_URL !== BASE) throw new Error('Configuração de autenticação incompleta');
  return { client, secret, callback: `${BASE}/oauth/callback/${provider}` };
}
export async function exchange(provider, cfg, code, verifier) {
  const params = new URLSearchParams({ client_id: cfg.client, client_secret: cfg.secret, code, redirect_uri: cfg.callback, code_verifier: verifier, grant_type: 'authorization_code' });
  const response = await fetch(provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: params
  });
  if (!response.ok) throw new Error('Falha na troca do código');
  const data = await response.json();
  if (data.error) throw new Error('Código rejeitado pelo provedor');
  return data;
}
export async function githubIdentity(token, cfg) {
  if (!token) throw new Error('Token GitHub ausente');
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'oauth-pages-lab' };
  try {
    const response = await fetch('https://api.github.com/user', { headers });
    if (!response.ok) throw new Error('Perfil GitHub indisponível');
    const profile = await response.json();
    if (!Number.isSafeInteger(profile.id)) throw new Error('ID GitHub inválido');
    return { id: String(profile.id), name: profile.name || profile.login, email: profile.email || null };
  } finally {
    const revocation = await fetch(`https://api.github.com/applications/${encodeURIComponent(cfg.client)}/grant`, {
      method: 'DELETE', headers: { Authorization: `Basic ${btoa(`${cfg.client}:${cfg.secret}`)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'oauth-pages-lab', 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: token })
    });
    if (revocation.status !== 204) throw new Error('Revogação da autorização GitHub não confirmada');
  }
}
