const loading = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');

async function checkSession() {
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
      window.location.replace('/');
      return;
    }
    if (!response.ok) throw new Error('Falha ao consultar sessão');
    const data = await response.json();
    if (!data.authenticated || !data.user) {
      window.location.replace('/');
      return;
    }
    const name = data.user.name || 'estudante';
    document.getElementById('user-name').textContent = name.trim().split(/\s+/)[0];
    document.getElementById('provider').textContent = 'Conectado com ' + (data.user.provider === 'google' ? 'Google' : 'GitHub');
    loading.hidden = true;
    dashboard.hidden = false;
  } catch {
    loading.textContent = 'Não foi possível verificar sua sessão. Atualize a página para tentar novamente.';
  }
}

checkSession();
