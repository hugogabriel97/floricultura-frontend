// assets/js/registro.js
(() => {
  const API_BASE = (window.__API_BASE__ || window.location.origin) + '/api';

  function $(sel){ return document.querySelector(sel); }
  function toast(msg, type='sucesso'){
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'), 50);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 2500);
  }

  async function apiFetch(path, opts={}){
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
      ...opts,
    });
    const data = await res.json().catch(()=> ({}));
    return { ok: res.ok, data };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formRegistro') || $('form#registerForm') || $('form');
    const nomeEl = $('#nome') || $('[name="nome"]');
    const emailEl = $('#email') || $('[name="email"]');
    const senhaEl = $('#senha') || $('[name="senha"]');
    const confirmarEl = $('#confirmarSenha') || $('[name="confirmarSenha"]');
    const btn = $('#btnRegistrar') || $('#btnCriarConta');

    if (!form || !nomeEl || !emailEl || !senhaEl) return console.warn('[registro.js] Form/inputs não encontrados');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = (nomeEl.value||'').trim();
      const email = (emailEl.value||'').trim();
      const senha = (senhaEl.value||'').trim();
      const confirmar = (confirmarEl?.value||'').trim();

      if (!nome || !email || !senha) return toast('Preencha nome, e-mail e senha.', 'erro');
      if (confirmarEl && senha !== confirmar) return toast('As senhas não coincidem.', 'erro');
      if (senha.length < 6) return toast('A senha deve ter ao menos 6 caracteres.', 'erro');

      btn && (btn.disabled = true, btn.textContent = 'Criando...');
      const resp = await apiFetch('/usuarios/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha })
      });
      btn && (btn.disabled = false, btn.textContent = 'Criar conta');

      if (!resp.ok || !resp.data?.success) {
        return toast(resp.data?.message || 'Erro ao criar conta!', 'erro');
      }

      const { token, usuario } = resp.data.data || {};
      if (token && usuario) {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }

      toast('Conta criada com sucesso!', 'sucesso');
      setTimeout(() => window.location.href = 'index.html', 900);
    });
  });
})();
