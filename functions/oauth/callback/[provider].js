import { callback, handle } from '../../_shared/auth.js';

export function onRequestGet({ request, env, params }) {
  return handle(() => callback(request, env, params.provider));
}
