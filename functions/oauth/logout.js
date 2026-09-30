import { logout, handle } from '../_shared/auth.js';

export function onRequestPost({ request, env }) {
  return handle(() => logout(request, env));
}
