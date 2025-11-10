// assets/js/contato.js
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById('formContato')?.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const assunto = document.getElementById('assunto').value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();

  if (!nome || !email || !mensagem) return toast('Preencha nome, e-mail e mensagem.', 'erro');
  if (!validarEmail(email)) return toast('E-mail inválido.', 'erro');

  try {
    await window.apiFetch('/api/contato', {
      method: 'POST',
      body: JSON.stringify({ nome, email, assunto, mensagem }),
    });
    toast('Mensagem enviada. Obrigado!', 'sucesso');
    ev.target.reset();
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erro ao enviar sua mensagem.', 'erro');
  }
});
