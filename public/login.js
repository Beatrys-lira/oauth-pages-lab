const loading = document.getElementById('loading');
const loginScreen = document.getElementById('login-screen');

function showLogin(message) {
  document.getElementById('login-status').textContent = message;
  loading.hidden = true;
  loginScreen.hidden = false;
}

async function checkSession() {
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
      showLogin('Escolha como deseja entrar.');
      return;
    }
    if (!response.ok) throw new Error('Falha ao consultar a sessão');
    const data = await response.json();
    if (data.authenticated && data.user) {
      window.location.replace('/dashboard.html');
      return;
    }
    showLogin('Escolha como deseja entrar.');
  } catch {
    showLogin('Não foi possível verificar sua sessão. Atualize a página para tentar novamente.');
  }
}

checkSession();
