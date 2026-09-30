const data = [
  { name: 'Desenvolvimento de software', growth: 10.2, openings: 95.3 },
  { name: 'Segurança da informação', growth: 21.0, openings: 14.1 },
  { name: 'Qualidade e testes', growth: 5.7, openings: 10.7 },
  { name: 'Desenvolvimento web', growth: 3.8, openings: 5.3 }
];

function renderBars(targetId, field, unit) {
  const container = document.getElementById(targetId);
  const sorted = [...data].sort((a, b) => b[field] - a[field]);
  const max = sorted[0][field];
  for (const item of sorted) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const top = document.createElement('div');
    top.className = 'bar-top';
    const label = document.createElement('span');
    label.textContent = item.name;
    const value = document.createElement('strong');
    value.textContent = item[field].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + unit;
    const track = document.createElement('div');
    track.className = 'track';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = (item[field] / max * 100).toFixed(1) + '%';
    track.append(fill);
    top.append(label, value);
    row.append(top, track);
    container.append(row);
  }
}

function renderProfile(user) {
  const name = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Visitante';
  const profile = document.getElementById('profile');
  const button = document.getElementById('profile-button');
  const card = document.getElementById('profile-card');
  const photo = document.getElementById('profile-photo');
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-initials').textContent = name.split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('pt-BR');
  document.getElementById('profile-message').textContent = `Obrigado por se conectar, ${name}!`;
  document.getElementById('profile-email').textContent = user.email || 'E-mail não disponibilizado pelo provedor.';
  button.setAttribute('aria-label', `Ver perfil de ${name}`);
  if (typeof user.picture === 'string') {
    try {
      const url = new URL(user.picture);
      if (url.protocol === 'https:') {
        photo.addEventListener('load', () => { photo.hidden = false; });
        photo.addEventListener('error', () => { photo.hidden = true; });
        photo.src = url.href;
      }
    } catch {}
  }
  function closeProfile() {
    card.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }
  button.addEventListener('click', () => {
    card.hidden = !card.hidden;
    button.setAttribute('aria-expanded', String(!card.hidden));
  });
  document.addEventListener('click', event => {
    if (!profile.contains(event.target)) closeProfile();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !card.hidden) {
      closeProfile();
      button.focus();
    }
  });
}

async function checkSession() {
  const loading = document.getElementById('loading');
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
      window.location.replace('/');
      return;
    }
    if (!response.ok) throw new Error('Sessão indisponível');
    const session = await response.json();
    if (!session.authenticated || !session.user) {
      window.location.replace('/');
      return;
    }
    renderProfile(session.user);
    renderBars('growth-bars', 'growth', '%');
    renderBars('openings-bars', 'openings', ' mil');
    loading.hidden = true;
    document.getElementById('dashboard').hidden = false;
  } catch {
    loading.textContent = 'Não foi possível consultar sua sessão. Atualize a página para tentar novamente.';
  }
}

checkSession();
