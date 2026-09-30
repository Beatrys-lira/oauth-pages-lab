import { encoder, decode, now } from './crypto.js';

export async function googleIdentity(token, client, nonce) {
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
  return { id: String(claims.sub), name: claims.name || claims.email, email: claims.email, picture: typeof claims.picture === 'string' ? claims.picture : null };
}
