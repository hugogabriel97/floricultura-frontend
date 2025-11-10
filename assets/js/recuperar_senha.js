// assets/js/recuperar_senha.js
(() => {
  const API_BASE = 'floricultura-backend-production.up.railway.app' + '/api';

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

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formRecuperarSenha') || $('form');
    const emailEl = $('#email') || $('[name="email"]');
    const btn = $('#btnRecuperar');

    if (!form || !emailEl) return console.warn('[recuperar_senha.js] Form/inputs não encontrados');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailEl.value||'').trim();
      if (!email) return toast('Informe seu e-mail.', 'erro');

      btn && (btn.disabled = true, btn.textContent = 'Enviando...');
      const resp = await apiFetch('/usuarios/recuperar', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      btn && (btn.disabled = false, btn.textContent = 'Enviar link');

      if (!resp.ok || !resp.data?.success) {
        return toast(resp.data?.message || 'Erro ao solicitar recuperação.', 'erro');
      }

      // Exibe link gerado no console pelo backend (modo demo)
      toast('Se o e-mail existir, enviaremos um link de redefinição.', 'sucesso');
    });
  });
})();
