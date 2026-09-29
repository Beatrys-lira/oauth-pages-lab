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
    renderBars('growth-bars', 'growth', '%');
    renderBars('openings-bars', 'openings', ' mil');
    loading.hidden = true;
    document.getElementById('dashboard').hidden = false;
  } catch {
    loading.textContent = 'Não foi possível consultar sua sessão. Atualize a página para tentar novamente.';
  }
}

checkSession();
