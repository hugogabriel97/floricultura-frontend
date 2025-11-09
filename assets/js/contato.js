// ===============================================
// contato.js — Página de contato com contador global
// ===============================================

const API = 'http://localhost:3000/api';
const contadorCarrinho = document.getElementById('contador-carrinho');
let usuarioLogado = null;
try {
  usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
} catch {
  usuarioLogado = null;
}

// ===============================
// Função auxiliar: validar e-mail
// ===============================
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===============================
// Atualizar contador do carrinho
// ===============================
async function atualizarContadorCarrinho() {
  if (!usuarioLogado) {
    contadorCarrinho.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/${usuarioLogado.id}`);
    if (!res.ok) throw new Error('Erro ao buscar carrinho');

    const data = await res.json();
    const itens = data?.data || [];
    const total = itens.reduce((soma, item) => soma + (item.quantidade || 1), 0);

    contadorCarrinho.textContent = total;
    contadorCarrinho.style.display = total > 0 ? 'inline-block' : 'none';
  } catch (err) {
    console.error('Erro ao atualizar contador do carrinho:', err);
  }
}

// ===============================
// Envio do formulário de contato
// ===============================
document.getElementById('formContato').addEventListener('submit', async (ev) => {
  ev.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const assunto = document.getElementById('assunto').value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();

  if (!nome || !email || !mensagem) {
    alert('Preencha nome, email e mensagem.');
    return;
  }

  if (!validarEmail(email)) {
    alert('Email inválido.');
    return;
  }

  try {
    const res = await fetch(`${API}/contato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, assunto, mensagem })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Mensagem enviada com sucesso! Obrigado pelo contato.');
      document.getElementById('formContato').reset();
    } else {
      alert(data.error || 'Erro ao enviar mensagem.');
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    alert('Erro no servidor. Tente novamente mais tarde.');
  }
});

// ===============================
// Inicialização
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  atualizarContadorCarrinho();
  setInterval(atualizarContadorCarrinho, 5000);
});
