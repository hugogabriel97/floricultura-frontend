const formRegistro = document.getElementById('formRegistro');

formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Erro ao criar conta');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar conta!');
  }
});