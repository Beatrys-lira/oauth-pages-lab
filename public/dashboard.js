const loading = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');

function showDashboard(user) {
  const name = user.name || 'estudante';
  const provider = user.provider === 'google' ? 'Google' : 'GitHub';
  document.getElementById('welcome-name').textContent = name.trim().split(/\s+/)[0];
  document.getElementById('user-name').textContent = name;
  document.getElementById('user-provider').textContent = provider;
  document.getElementById('avatar').textContent = name.trim().charAt(0).toLocaleUpperCase('pt-BR');
  loading.hidden = true;
  dashboard.hidden = false;
}

async function checkSession() {
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
      window.location.replace('/');
      return;
    }
    if (!response.ok) throw new Error('Falha ao consultar a sessão');
    const data = await response.json();
    if (data.authenticated && data.user) showDashboard(data.user);
    else window.location.replace('/');
  } catch {
    loading.textContent = 'Não foi possível consultar sua sessão. Atualize a página para tentar novamente.';
  }
}

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    document.querySelectorAll('.career-card').forEach(card => {
      card.hidden = category !== 'todas' && card.dataset.category !== category;
      if (!card.hidden) visible += 1;
    });
    document.getElementById('filter-count').textContent = visible === 1 ? '1 trilha' : visible + ' trilhas';
  });
});

checkSession();
