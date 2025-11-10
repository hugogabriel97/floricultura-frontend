// assets/js/login.js
const formLogin = document.getElementById('formLogin');

formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!email || !senha) return toast('Informe e-mail e senha.', 'erro');

  try {
    const data = await window.apiFetch('/api/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    // pode vir {success, data:{usuario, token}} ou {usuario, token}
    const payload = data?.data || data;
    window.setToken(payload.token);
    window.setUsuario(payload.usuario);

    toast('Login realizado!', 'sucesso');
    window.atualizarHeaderUI();
    window.atualizarContadorCarrinho();
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erro ao fazer login.', 'erro');
  }
});
