import { me } from '../_middleware.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') {
    return new Response('Rota não encontrada', {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  try {
    return await me(request, env);
  } catch {
    return new Response('Não foi possível consultar a sessão.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
