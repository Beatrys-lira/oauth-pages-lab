import { start, handle } from '../../_shared/auth.js';

export function onRequestGet({ request, env, params }) {
  return handle(() => start(request, env, params.provider));
}
