// assets/js/login.js
(() => {
  // ✅ AJUSTE FEITO: Adicionado "https://" no início da URL.
  const API_BASE = 'https://floricultura-backend-production.up.railway.app' + '/api';

  function $(sel) { return document.querySelector(sel); }
  function toast(msg, type='sucesso') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'), 50);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 2500);
  }

  async function apiFetch(path, opts={}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
      ...opts,
    });
    const data = await res.json().catch(()=> ({}));
    return { ok: res.ok, data };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formLogin') || $('form#loginForm') || $('form');
    const emailEl = $('#email') || $('[name="email"]');
    const senhaEl = $('#senha') || $('[name="senha"]');
    const btn = $('#btnLogin') || $('#btnEntrar');

    if (!form || !emailEl || !senhaEl) return console.warn('[login.js] Form/inputs não encontrados');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailEl.value || '').trim();
      const senha = (senhaEl.value || '').trim();

      if (!email || !senha) {
        toast('Preencha e-mail e senha.', 'erro');
        return;
      }
      btn && (btn.disabled = true, btn.textContent = 'Entrando...');

      const resp = await apiFetch('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });

      btn && (btn.disabled = false, btn.textContent = 'Entrar');

      if (!resp.ok || !resp.data?.success) {
        return toast(resp.data?.message || 'Erro ao fazer login!', 'erro');
      }

      const { token, usuario } = resp.data.data || {};
      if (!token || !usuario) {
        return toast('Resposta inválida do servidor.', 'erro');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      toast('Login realizado com sucesso!', 'sucesso');
      setTimeout(() => {
        // leve para a Home ou Produtos
        window.location.href = 'index.html';
      }, 800);
    });
  });
})();