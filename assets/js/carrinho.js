// =============================================
// carrinho.js — Frontend aprimorado
// =============================================

const carrinhoContainer = document.getElementById('carrinhoContainer');
const resumoCarrinho = document.getElementById('resumoCarrinho');
const contadorCarrinho = document.querySelector('#contador-carrinho');

let usuarioLogado = null;
try {
  usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
} catch {
  usuarioLogado = null;
}

// === Redirecionar se não estiver logado ===
if (!usuarioLogado) {
  mostrarMensagem('⚠️ Você precisa estar logado para acessar o carrinho.', 'erro');
  setTimeout(() => (window.location.href = 'login.html'), 1500);
}

// ===============================
// Atualizar Header
// ===============================
function atualizarHeader() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');
  const usuarioLogadoEl = document.getElementById('usuarioLogado');
  const btnLogout = document.getElementById('btnLogout');
  const linkLogin = document.getElementById('linkLogin');
  const linkRegistro = document.getElementById('linkRegistro');

  if (usuario && token) {
    usuarioLogadoEl.textContent = `Olá, ${usuario.nome}`;
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

  btnLogout.onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
  };
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
    const totalItens = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0);

    if (contadorCarrinho) {
      contadorCarrinho.textContent = totalItens;
      contadorCarrinho.style.display = totalItens > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Erro ao atualizar contador do carrinho:', err);
    if (contadorCarrinho) contadorCarrinho.style.display = 'none';
  }
}

// ===============================
// Carregar carrinho
// ===============================
async function carregarCarrinho() {
  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/${usuarioLogado.id}`);
    const data = await res.json();

    carrinhoContainer.innerHTML = '';
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      carrinhoContainer.innerHTML = '<p style="text-align:center;">🛍️ Seu carrinho está vazio.</p>';
      resumoCarrinho.innerHTML = '';
      await atualizarContadorCarrinho();
      return;
    }

    const itens = data.data;
    let total = 0;

    itens.forEach(item => {
      const subtotal = item.quantidade * parseFloat(item.Produto.preco);
      total += subtotal;

      const card = document.createElement('div');
      card.className = 'product-card';

      const imgSrc = item.Produto.imagemUrl
        ? `http://localhost:3000${item.Produto.imagemUrl}`
        : 'assets/img/placeholder.jpg';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${item.Produto.nome}" class="product-img">
        <div class="product-info">
          <h3>${item.Produto.nome}</h3>
          <p class="preco">💲 R$ ${Number(item.Produto.preco).toFixed(2)}</p>
          <p class="categoria">🌸 ${item.Produto.categoria || 'Sem categoria'}</p>
          <p>Quantidade: 
            <input type="number" min="1" value="${item.quantidade}" 
              style="width:50px;" onchange="atualizarQuantidade(${item.id}, this.value)">
          </p>
          <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
          <button class="btn btn-remover" onclick="removerItem(${item.id})">Remover</button>
        </div>
      `;
      carrinhoContainer.appendChild(card);
    });

    resumoCarrinho.innerHTML = `
      <div class="resumo-total">
        <strong>Total: R$ ${total.toFixed(2)}</strong>
        <button class="btn btn-finalizar" onclick="finalizarCompra()">Finalizar Compra</button>
      </div>
    `;

    await atualizarContadorCarrinho();
  } catch (err) {
    console.error('Erro ao carregar carrinho:', err);
    carrinhoContainer.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar carrinho.</p>';
  }
}

// ===============================
// Atualizar quantidade
// ===============================
async function atualizarQuantidade(carrinhoId, novaQuantidade) {
  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/${carrinhoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: parseInt(novaQuantidade) })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      mostrarMensagem(data.message || 'Erro ao atualizar quantidade.', 'erro');
      return;
    }

    mostrarMensagem('🔄 Quantidade atualizada!', 'sucesso');
    carregarCarrinho();
  } catch (err) {
    console.error('Erro ao atualizar quantidade:', err);
    mostrarMensagem('Erro ao atualizar quantidade.', 'erro');
  }
}

// ===============================
// Remover item
// ===============================
async function removerItem(carrinhoId) {
  const confirma = await confirmarAcao('Deseja remover este item do carrinho?');
  if (!confirma) return;

  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/${carrinhoId}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok || !data.success) {
      mostrarMensagem(data.message || 'Erro ao remover item.', 'erro');
      return;
    }

    mostrarMensagem('🗑️ Item removido do carrinho.', 'sucesso');
    carregarCarrinho();
  } catch (err) {
    console.error('Erro ao remover item:', err);
    mostrarMensagem('Erro ao remover item.', 'erro');
  }
}

// ===============================
// Finalizar compra
// ===============================
async function finalizarCompra() {
  try {
    const res = await fetch(`http://localhost:3000/api/carrinho/usuario/${usuarioLogado.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      mostrarMensagem(data.message || 'Erro ao finalizar compra.', 'erro');
      return;
    }

    mostrarMensagem('💐 Compra finalizada com sucesso!', 'sucesso');
    await atualizarContadorCarrinho();
    localStorage.removeItem('carrinho');
    setTimeout(() => (window.location.href = 'produtos.html'), 1500);
  } catch (err) {
    console.error('Erro ao finalizar compra:', err);
    mostrarMensagem('Erro ao finalizar compra.', 'erro');
  }
}

// ===============================
// Toast (mensagem visual)
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

// ===============================
// Modal de confirmação customizado
// ===============================
function confirmarAcao(mensagem) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <p>${mensagem}</p>
        <div class="confirm-buttons">
          <button id="confirmSim" class="btn">Sim</button>
          <button id="confirmNao" class="btn btn-cancelar">Não</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirmSim').onclick = () => {
      overlay.remove();
      resolve(true);
    };
    overlay.querySelector('#confirmNao').onclick = () => {
      overlay.remove();
      resolve(false);
    };
  });
}

// ===============================
// Inicialização
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  atualizarHeader();
  carregarCarrinho();
  atualizarContadorCarrinho();
});
