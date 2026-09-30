export const encoder = new TextEncoder();
export const now = () => Math.floor(Date.now() / 1000);
export const random = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
export const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
export const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
export const hash = async value => b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
