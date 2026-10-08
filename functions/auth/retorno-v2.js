export function onRequestGet({ request }) {
  const url = new URL(request.url);
  const parametros = Object.fromEntries(url.searchParams);

  return Response.json(parametros, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
