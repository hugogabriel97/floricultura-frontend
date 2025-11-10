// assets/js/recuperar_senha.js
const formRecuperar = document.getElementById('formRecuperarSenha');

formRecuperar?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailRecuperacao').value.trim();
  if (!email) return toast('Informe um e-mail válido.', 'erro');

  try {
    const data = await window.apiFetch('/api/usuarios/recuperar', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    // Mostra o link no modal ou um alerta (simulado)
    const link = (data?.data && data.data.link) || data.link;
    if (link) {
      console.log('Link de recuperação:', link);
      alert('Link de recuperação gerado! (Veja o console do servidor ou este alerta)');
    }
    toast('Se o e-mail existir, enviaremos instruções.', 'sucesso');
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erro ao solicitar recuperação.', 'erro');
  }
});
