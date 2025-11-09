const formRecuperar = document.getElementById('formRecuperarSenha');

formRecuperar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailRecuperacao').value;

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/recuperar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Verifique o console do servidor para o link de recuperação.');
      console.log('Link de recuperação:', data.link);
    } else {
      alert(data.error || 'Erro ao solicitar recuperação.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Falha ao enviar solicitação.');
  }
});
