const data = [
  { id: 'software', name: 'Desenvolvimento de software', short: 'Software', growth: 10.2, openings: 95.3, color: '#8c7296', description: 'Cria e mantém aplicações, trabalhando com requisitos, lógica, código e evolução dos sistemas.', insight: 'É a área com mais aberturas anuais neste recorte, embora não tenha a maior taxa de crescimento.' },
  { id: 'security', name: 'Segurança da informação', short: 'Segurança', growth: 21.0, openings: 14.1, color: '#a54e6d', description: 'Trabalha na proteção de informações e sistemas, na identificação de riscos e na resposta a incidentes.', insight: 'Tem o maior crescimento percentual das quatro áreas. Seu volume de vagas, porém, é menor que o de desenvolvimento de software.' },
  { id: 'qa', name: 'Qualidade e testes', short: 'QA e testes', growth: 5.7, openings: 10.7, color: '#75687d', description: 'Planeja e executa testes, registra defeitos e verifica se o software atende aos requisitos. Combina análise, atenção aos detalhes e conhecimento técnico.', insight: 'O crescimento de 5,7% e as 10,7 mil aberturas anuais são medidas diferentes: a segunda também considera reposição de trabalhadores.' },
  { id: 'web', name: 'Desenvolvimento web', short: 'Web', growth: 3.8, openings: 5.3, color: '#a06a56', description: 'Desenvolve e mantém sites e aplicações web, conectando interfaces, funcionalidades e serviços.', insight: 'Neste recorte, apresenta os menores valores nos dois indicadores. Isso não mede a qualidade da carreira nem a facilidade de conseguir uma vaga.' }
];

const format = value => value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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
  document.getElementById('welcome-name').textContent = `Olá, ${name.split(/\s+/)[0]}!`;
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

function svgElement(tag, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderComparison() {
  const svg = svgElement('svg', { viewBox: '0 0 440 285', role: 'img', 'aria-labelledby': 'scatter-title scatter-description' });
  svg.append(svgElement('title', { id: 'scatter-title' }, 'Vagas anuais e crescimento projetado por área'));
  svg.append(svgElement('desc', { id: 'scatter-description' }, data.map(item => `${item.name}: ${format(item.openings)} mil vagas por ano e crescimento de ${format(item.growth)}%.`).join(' ')));
  const x = value => 44 + value / 100 * 370;
  const y = value => 230 - value / 25 * 190;
  for (let value = 0; value <= 25; value += 5) {
    svg.append(svgElement('line', { x1: 44, x2: 414, y1: y(value), y2: y(value), stroke: '#eee3e9' }));
    svg.append(svgElement('text', { x: 36, y: y(value) + 4, 'text-anchor': 'end' }, `${value}%`));
  }
  for (let value = 0; value <= 100; value += 25) {
    svg.append(svgElement('text', { x: x(value), y: 248, 'text-anchor': 'middle' }, String(value)));
  }
  svg.append(svgElement('text', { x: 44, y: 21, class: 'axis-title' }, 'Crescimento projetado (%)'));
  svg.append(svgElement('text', { x: 229, y: 274, class: 'axis-title', 'text-anchor': 'middle' }, 'Aberturas anuais (milhares de vagas)'));
  for (const item of data) {
    const point = svgElement('circle', { cx: x(item.openings), cy: y(item.growth), r: 6, fill: item.color, stroke: '#fff', 'stroke-width': 2 });
    point.append(svgElement('title', {}, `${item.name}: ${format(item.openings)} mil / ${format(item.growth)}%`));
    svg.append(point);
    const right = item.id === 'software';
    const below = item.id === 'web';
    svg.append(svgElement('text', { x: x(item.openings) + (right ? -10 : 10), y: y(item.growth) + (below ? 17 : -10), 'text-anchor': right ? 'end' : 'start', class: 'point-label' }, item.short));
  }
  document.getElementById('comparison-plot').replaceChildren(svg);
}

function renderArea() {
  const item = data.find(area => area.id === document.getElementById('area-select').value);
  if (!item) return;
  const title = document.createElement('h3');
  title.textContent = item.name;
  const metrics = document.createElement('div');
  metrics.className = 'area-metrics';
  for (const [value, label] of [[`${format(item.growth)}%`, 'crescimento em dez anos'], [`${format(item.openings)} mil`, 'aberturas por ano']]) {
    const metric = document.createElement('div');
    metric.className = 'area-metric';
    const strong = document.createElement('strong');
    strong.textContent = value;
    const span = document.createElement('span');
    span.textContent = label;
    metric.append(strong, span);
    metrics.append(metric);
  }
  const description = document.createElement('p');
  description.textContent = item.description;
  const insight = document.createElement('p');
  insight.className = 'area-insight';
  insight.textContent = item.insight;
  document.getElementById('area-details').replaceChildren(title, metrics, description, insight);
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
    renderComparison();
    renderArea();
    document.getElementById('area-select').addEventListener('change', renderArea);
    loading.hidden = true;
    document.getElementById('dashboard').hidden = false;
  } catch {
    loading.textContent = 'Não foi possível consultar sua sessão. Atualize a página para tentar novamente.';
  }
}

checkSession();

