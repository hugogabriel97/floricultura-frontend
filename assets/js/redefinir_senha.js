// assets/js/redefinir_senha.js
(() => {
  const API_BASE = (window.__API_BASE__ || window.location.origin) + '/api';

  function $(s){ return document.querySelector(s); }
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

  function getToken() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formRedefinirSenha') || $('form');
    const novaEl = $('#novaSenha') || $('[name="novaSenha"]');
    const confirmaEl = $('#confirmarSenha') || $('[name="confirmarSenha"]');
    const btn = $('#btnRedefinir');

    if (!form || !novaEl) return console.warn('[redefinir_senha.js] Form/inputs não encontrados');

    const token = getToken();
    if (!token) {
      toast('Token ausente ou inválido.', 'erro');
      form.style.display = 'none';
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nova = (novaEl.value||'').trim();
      const conf = (confirmaEl?.value||'').trim();

      if (!nova || (confirmaEl && nova !== conf)) {
        return toast('Verifique a nova senha e a confirmação.', 'erro');
      }
      if (nova.length < 6) return toast('A nova senha deve ter ao menos 6 caracteres.', 'erro');

      btn && (btn.disabled = true, btn.textContent = 'Atualizando...');
      const resp = await apiFetch('/usuarios/redefinir', {
        method: 'POST',
        body: JSON.stringify({ token, novaSenha: nova })
      });
      btn && (btn.disabled = false, btn.textContent = 'Redefinir senha');

      if (!resp.ok || !resp.data?.success) {
        return toast(resp.data?.message || 'Erro ao redefinir senha.', 'erro');
      }

      toast('Senha redefinida com sucesso! Faça login novamente.', 'sucesso');
      setTimeout(()=> window.location.href = 'login.html', 1200);
    });
  });
})();
