// =============================================
// produtos.js — versão aprimorada
// =============================================

const listaProdutos = document.getElementById('listaProdutos');
const btnCadastrar = document.getElementById('btnCadastrarProduto');
const contadorCarrinho = document.querySelector('#contador-carrinho');

let usuarioLogado = null;
try {
  usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
} catch {
  usuarioLogado = null;
}

// ===============================
// Verificar permissão de admin
// ===============================
function verificarPermissao() {
  if (usuarioLogado?.tipoUsuario === 'admin') {
    btnCadastrar.style.display = 'inline-block';
    btnCadastrar.onclick = () => (window.location.href = 'admin_produtos.html');
  } else {
    btnCadastrar.style.display = 'none';
  }
}

// ===============================
// Atualizar contador de carrinho
// ===============================
async function atualizarContadorCarrinho() {
  if (!usuarioLogado) return;
  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/${usuarioLogado.id}`);
    const data = await res.json();
    const itens = data?.data || [];
    const total = itens.reduce((soma, item) => soma + (item.quantidade || 1), 0);
    if (contadorCarrinho) {
      contadorCarrinho.textContent = total;
      contadorCarrinho.style.display = total > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Erro ao atualizar contador do carrinho:', err);
  }
}

// ===============================
// Carregar produtos
// ===============================
async function carregarProdutos() {
  try {
    const res = await fetch('http://localhost:3000/api/produtos');
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    const produtos = await res.json();
    listaProdutos.innerHTML = '';

    if (!Array.isArray(produtos) || produtos.length === 0) {
      listaProdutos.innerHTML = '<p style="text-align:center;">Nenhum produto disponível.</p>';
      return;
    }

    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = produto.imagemUrl
        ? `http://localhost:3000${produto.imagemUrl}`
        : 'assets/img/placeholder.jpg';

      const botao =
        usuarioLogado?.tipoUsuario === 'admin'
          ? `<button class="btn-editar" onclick="editarProduto(${produto.id})">Editar Produto</button>`
          : `<button class="btn-comprar" data-id="${produto.id}">Adicionar ao Carrinho</button>`;

      card.innerHTML = `
        <img src="${imgSrc}" alt="${produto.nome}" class="product-img">
        <div class="product-info">
          <h3>${produto.nome}</h3>
          <p>${produto.descricao || ''}</p>
          <p class="preco">💲 R$ ${Number(produto.preco).toFixed(2)}</p>
          ${botao}
        </div>
      `;
      listaProdutos.appendChild(card);
    });

    document.querySelectorAll('.btn-comprar').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = "Adicionando...";
        await adicionarAoCarrinho(btn.dataset.id, btn);
        btn.disabled = false;
      });
    });

  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    listaProdutos.innerHTML =
      '<p style="color:red; text-align:center;">Erro ao carregar produtos. Verifique o backend.</p>';
  }
}

// ===============================
// Adicionar ao carrinho
// ===============================
async function adicionarAoCarrinho(idProduto, botao) {
  try {
    if (!usuarioLogado) {
      mostrarMensagem('⚠️ Faça login para adicionar produtos.', 'erro');
      setTimeout(() => (window.location.href = 'login.html'), 1500);
      return;
    }

    const res = await fetch('http://localhost:3000/api/carrinho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: usuarioLogado.id,
        produtoId: idProduto,
        quantidade: 1
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      mostrarMensagem(data.message || 'Erro ao adicionar produto.', 'erro');
      return;
    }

    botao.textContent = "✅ Adicionado!";
    setTimeout(() => (botao.textContent = "Adicionar ao Carrinho"), 1500);
    mostrarMensagem('✅ Produto adicionado ao carrinho!', 'sucesso');
    atualizarContadorCarrinho();
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    mostrarMensagem('Erro ao adicionar produto.', 'erro');
  }
}

// ===============================
// Mostrar mensagem toast
// ===============================
function mostrarMensagem(texto, tipo = 'sucesso') {
  const toast = document.createElement('div');
  toast.textContent = texto;
  toast.className = `toast ${tipo}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function editarProduto(id) {
  window.location.href = `admin_produtos.html?id=${id}`;
}

window.addEventListener('DOMContentLoaded', () => {
  verificarPermissao();
  carregarProdutos();
  atualizarContadorCarrinho();
});
