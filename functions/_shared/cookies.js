export const cookie = (name, value, age, sameSite = 'Strict') => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=${age}`;
export const cookies = request => Object.fromEntries((request.headers.get('Cookie') || '').split(';').map(x => x.trim().split('=').slice(0, 2)).filter(x => x.length === 2));
