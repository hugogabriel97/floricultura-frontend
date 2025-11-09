// ===============================================
// index.js — Página inicial com contador global
// ===============================================

// Elementos do header
const usuarioLogadoEl = document.getElementById('usuarioLogado');
const btnLogout = document.getElementById('btnLogout');
const linkLogin = document.getElementById('linkLogin');
const linkRegistro = document.getElementById('linkRegistro');
const contadorCarrinho = document.getElementById('contador-carrinho');

let usuarioLogado = null;
try {
  usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
} catch {
  usuarioLogado = null;
}

// ===============================
// Atualizar Header e Sessão
// ===============================
function atualizarHeader() {
  const token = localStorage.getItem('token');
  usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

  if (token && usuarioLogado) {
    usuarioLogadoEl.textContent = `Olá, ${usuarioLogado.nome}`;
    usuarioLogadoEl.style.display = 'inline';
    btnLogout.style.display = 'inline-block';
    linkLogin.style.display = 'none';
    linkRegistro.style.display = 'none';
  } else {
    usuarioLogadoEl.style.display = 'none';
    btnLogout.style.display = 'none';
    linkLogin.style.display = 'inline';
    linkRegistro.style.display = 'inline';
  }
}

// ===============================
// Logout
// ===============================
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  atualizarHeader();
  window.location.href = 'index.html';
});

// ===============================
// Atualizar contador de carrinho
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
// Carregar produtos em destaque
// ===============================
async function carregarDestaques() {
  try {
    const res = await fetch('http://localhost:3000/api/produtos');
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    const produtos = await res.json();

    const destaquesContainer = document.getElementById('destaques');
    destaquesContainer.innerHTML = '';

    produtos.slice(0, 4).forEach(produto => {
      const imgSrc = produto.imagemUrl
        ? `http://localhost:3000${produto.imagemUrl}`
        : 'assets/img/placeholder.jpg';

      const div = document.createElement('div');
      div.classList.add('product-card');
      div.innerHTML = `
        <img src="${imgSrc}" alt="${produto.nome}" />
        <h3>${produto.nome}</h3>
        <p>R$ ${Number(produto.preco).toFixed(2)}</p>
      `;
      destaquesContainer.appendChild(div);
    });
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

// ===============================
// Inicialização
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  atualizarHeader();
  carregarDestaques();
  atualizarContadorCarrinho();

  // Atualiza o contador de tempos em tempos (caso o usuário mude o carrinho em outra aba)
  setInterval(atualizarContadorCarrinho, 5000);
});
