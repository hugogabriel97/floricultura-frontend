const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    console.log('Resposta do backend:', data, res.status);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Erro ao fazer login');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer login!');
  }
});