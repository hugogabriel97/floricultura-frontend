// assets/js/auth.js
// Utilitários de autenticação + API base + contador do carrinho

(function () {
  // ==== 1) Descobrir API_BASE automaticamente ====
  // Prioridade: <meta name="api-base" content="https://seu-backend"> > window.API_BASE > heurística por host
  const meta = document.querySelector('meta[name="api-base"]');
  let API_BASE =
    (meta && meta.content) ||
    window.API_BASE ||
    (location.hostname.includes('localhost') || location.hostname.includes('127.0.0.1')
      ? 'http://localhost:3000'
      : // tente inferir a “irmã” do Railway:
        (() => {
          // Se seu backend está em outro serviço, defina via meta tag. Aqui é apenas um fallback educado.
          // Ex.: backend: https://floricultura-backend.up.railway.app
          //      frontend: https://floricultura-frontend.up.railway.app
          // Se forem apps no Railway, você provavelmente tem um domínio diferente. Ajuste abaixo se necessário:
          return 'https://floricultura-frontend-production.up.railway.app/';
        })());

  // Exponha para outras páginas (caso precise)
  window.API_BASE = API_BASE;

  // ==== 2) Helpers de auth no localStorage ====
  function getToken() {
    return localStorage.getItem('token');
  }
  function setToken(tk) {
    if (tk) localStorage.setItem('token', tk);
  }
  function getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario'));
    } catch {
      return null;
    }
  }
  function setUsuario(u) {
    if (u) localStorage.setItem('usuario', JSON.stringify(u));
  }
  function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  // ==== 3) Fetch padronizado ====
  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {},
      token ? { Authorization: `Bearer ${token}` } : {}
    );

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';

    let data;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => ({}));
    } else {
      data = await res.text().catch(() => '');
    }

    // Normaliza erro
    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        `Erro HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  // ==== 4) Atualizar header (login / logout / exibir carrinho) ====
  function atualizarHeaderUI() {
    const usuario = getUsuario();
    const token = getToken();
    const usuarioLogadoEl = document.getElementById('usuarioLogado');
    const btnLogout = document.getElementById('btnLogout');
    const linkLogin = document.getElementById('linkLogin');
    const linkRegistro = document.getElementById('linkRegistro');
    const linkCarrinho = document.getElementById('linkCarrinho');

    if (usuario && token) {
      if (usuarioLogadoEl) {
        usuarioLogadoEl.textContent = `Olá, ${usuario.nome}`;
        usuarioLogadoEl.style.display = 'inline';
      }
      if (btnLogout) btnLogout.style.display = 'inline-block';
      if (linkLogin) linkLogin.style.display = 'none';
      if (linkRegistro) linkRegistro.style.display = 'none';
      if (linkCarrinho) linkCarrinho.style.display = 'inline';
    } else {
      if (usuarioLogadoEl) {
        usuarioLogadoEl.textContent = '';
        usuarioLogadoEl.style.display = 'none';
      }
      if (btnLogout) btnLogout.style.display = 'none';
      if (linkLogin) linkLogin.style.display = 'inline';
      if (linkRegistro) linkRegistro.style.display = 'inline';
      if (linkCarrinho) linkCarrinho.style.display = 'none';
    }

    if (btnLogout) {
      btnLogout.onclick = () => {
        clearAuth();
        atualizarHeaderUI();
        window.location.href = 'index.html';
      };
    }
  }

  // ==== 5) Contador do carrinho (global) ====
  async function atualizarContadorCarrinho() {
    const usuario = getUsuario();
    const contador = document.querySelector('#contador-carrinho');
    if (!usuario || !contador) return;

    try {
      const data = await apiFetch(`/api/carrinho/${usuario.id}`, { method: 'GET' });

      // backend pode retornar { success, data: [] } OU [] puro.
      const itens = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const total = itens.reduce((soma, it) => soma + (Number(it.quantidade) || 1), 0);

      contador.textContent = total;
      contador.style.display = total > 0 ? 'inline-block' : 'none';
    } catch (err) {
      // em caso de erro, esconda o badge
      if (contador) contador.style.display = 'none';
      console.error('Erro contador carrinho:', err.message);
    }
  }

  // ==== 6) Toast simples ====
  function toast(msg, tipo = 'sucesso') {
    const div = document.createElement('div');
    div.textContent = msg;
    div.className = `toast ${tipo}`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 20);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    }, 2500);
  }

  // Expor no escopo global
  window.apiFetch = apiFetch;
  window.getUsuario = getUsuario;
  window.setUsuario = setUsuario;
  window.getToken = getToken;
  window.setToken = setToken;
  window.clearAuth = clearAuth;
  window.atualizarHeaderUI = atualizarHeaderUI;
  window.atualizarContadorCarrinho = atualizarContadorCarrinho;
  window.toast = toast;

  // Inicialização automática do header + contador
  window.addEventListener('DOMContentLoaded', () => {
    atualizarHeaderUI();
    atualizarContadorCarrinho();
  });
})();
