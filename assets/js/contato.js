// assets/js/contato.js
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById('formContato')?.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  
  const form = ev.target;
  const btn = form.querySelector('button[type="submit"]'); // Pega o botão

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const assunto = document.getElementById('assunto').value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();

  if (!nome || !email || !mensagem) return window.toast('Preencha nome, e-mail e mensagem.', 'erro');
  if (!validarEmail(email)) return window.toast('E-mail inválido.', 'erro');

  // Desabilita o botão
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  }

  try {
    // A rota '/api/contato' agora vai funcionar
    await window.apiFetch('/api/contato', {
      method: 'POST',
      body: JSON.stringify({ nome, email, assunto, mensagem }),
    });
    window.toast('Mensagem enviada. Obrigado!', 'sucesso');
    form.reset(); // Limpa o formulário
  } catch (err) {
    console.error(err);
    window.toast(err.message || 'Erro ao enviar sua mensagem.', 'erro');
  } finally {
    // Reabilita o botão
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Enviar Mensagem';
    }
  }
});