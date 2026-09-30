import { plain } from './_shared/auth.js';

export function onRequest({ request, next }) {
  const path = new URL(request.url).pathname;
  if (path.startsWith('/oauth/')) {
    const providerRoute = /^\/oauth\/(login|callback)\/(google|github)$/.test(path);
    const allowed = (providerRoute && request.method === 'GET')
      || (path === '/oauth/logout' && request.method === 'POST');
    if (!allowed) return plain('Rota não encontrada', 404);
  }
  return next();
}
