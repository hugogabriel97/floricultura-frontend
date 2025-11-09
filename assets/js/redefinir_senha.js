// frontend/assets/js/redefinir_senha.js
const formRedefinir = document.getElementById('formRedefinirSenha');
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

formRedefinir.addEventListener('submit', async (e) => {
  e.preventDefault();
  const novaSenha = document.getElementById('novaSenha').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/redefinir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Senha redefinida com sucesso!');
      window.location.href = 'login.html';
    } else {
      alert(data.error || 'Erro ao redefinir senha.');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Falha ao redefinir senha.');
  }
});
