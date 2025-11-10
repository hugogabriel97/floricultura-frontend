// assets/js/redefinir_senha.js
const formRedefinir = document.getElementById('formRedefinirSenha');
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

formRedefinir?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const novaSenha = document.getElementById('novaSenha')?.value.trim();
  const confirmarSenha = document.getElementById('confirmarSenha')?.value?.trim();

  if (!novaSenha || novaSenha.length < 6) return toast('A senha deve ter ao menos 6 caracteres.', 'erro');
  if (confirmarSenha !== undefined && novaSenha !== confirmarSenha) return toast('As senhas não coincidem.', 'erro');
  if (!token) return toast('Token ausente ou inválido.', 'erro');

  try {
    await window.apiFetch('/api/usuarios/redefinir', {
      method: 'POST',
      body: JSON.stringify({ token, novaSenha }),
    });

    toast('Senha redefinida com sucesso!', 'sucesso');
    setTimeout(() => (window.location.href = 'login.html'), 1000);
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erro ao redefinir senha.', 'erro');
  }
});
