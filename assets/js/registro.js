// assets/js/registro.js
const formRegistro = document.getElementById('formRegistro');

formRegistro?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!nome || !email || !senha) return toast('Preencha nome, e-mail e senha.', 'erro');

  try {
    const data = await window.apiFetch('/api/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });

    const payload = data?.data || data;
    window.setToken(payload.token);
    window.setUsuario(payload.usuario);

    toast('Conta criada com sucesso!', 'sucesso');
    window.atualizarHeaderUI();
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erro ao criar conta.', 'erro');
  }
});
