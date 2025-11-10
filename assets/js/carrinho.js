// assets/js/carrinho.js

// ✅ CORREÇÃO 1: Envolver todo o script em 'DOMContentLoaded'
// Isso garante que o auth.js (carregado com 'defer') já rodou
// e definiu window.getUsuario() antes deste script tentar usá-lo.
window.addEventListener('DOMContentLoaded', () => {

  const carrinhoContainer = document.getElementById('carrinhoContainer');
  const resumoCarrinho = document.getElementById('resumoCarrinho');

  // ✅ CORREÇÃO 2: Mover a verificação para DENTRO do listener
  const usuarioLogado = window.getUsuario();
  if (!usuarioLogado) {
    window.toast('Você precisa estar logado para acessar o carrinho.', 'erro');
    setTimeout(() => (window.location.href = 'login.html'), 1200);
    return; // Para o script se não estiver logado
  }

  async function carregarCarrinho() {
    try {
      const data = await window.apiFetch(`/api/carrinho/${usuarioLogado.id}`, { method: 'GET' });
      
      // ✅ CORREÇÃO 3: Sua API retorna { success: true, data: [...] }
      // Devemos ler a chave 'data'
      const itens = Array.isArray(data?.data) ? data.data : [];

      carrinhoContainer.innerHTML = '';
      if (!itens.length) {
        carrinhoContainer.innerHTML = '<p style="text-align:center;">🛍️ Seu carrinho está vazio.</p>';
        resumoCarrinho.innerHTML = '';
        window.atualizarContadorCarrinho(); // Atualiza o contador (para 0)
        return;
      }

      let total = 0;
      
      // ✅ CORREÇÃO 4: Corrigir a URL base da imagem
      const apiBaseSemApi = window.API_BASE.replace('/api', '');

      itens.forEach((item) => {
        const produto = item.Produto || item.produto || {}; // fallback
        const preco = Number(produto.preco || 0);
        const qtd = Number(item.quantidade || 1);
        const subtotal = preco * qtd;
        total += subtotal;

        const card = document.createElement('div');
        card.className = 'product-card';

        const imgSrc = produto.imagemUrl 
            ? `${apiBaseSemApi}${produto.imagemUrl}` // Ex: https://backend.com/uploads/img.png
            : 'assets/img/placeholder.jpg';

        card.innerHTML = `
          <img src="${imgSrc}" alt="${produto.nome || ''}" class="product-img">
          <div class="product-info">
            <h3>${produto.nome || 'Produto'}</h3>
            <p class="preco">💲 R$ ${preco.toFixed(2)}</p>
            <p class="categoria">🌸 ${produto.categoria || 'Sem categoria'}</p>
            <p>Quantidade: 
              <input type="number" min="1" value="${qtd}" style="width:50px;"
                onchange="atualizarQuantidade(${item.id}, this.value)">
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

      window.atualizarContadorCarrinho();
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
      carrinhoContainer.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar carrinho.</p>';
    }
  }

  async function atualizarQuantidade(carrinhoId, novaQuantidade) {
    try {
      await window.apiFetch(`/api/carrinho/${carrinhoId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantidade: parseInt(novaQuantidade, 10) }),
      });
      window.toast('Quantidade atualizada!', 'sucesso');
      carregarCarrinho(); // Recarrega tudo
    } catch (err) {
      console.error(err);
      window.toast(err.message || 'Erro ao atualizar quantidade.', 'erro');
    }
  }

  async function removerItem(carrinhoId) {
    try {
      await window.apiFetch(`/api/carrinho/${carrinhoId}`, { method: 'DELETE' });
      window.toast('Item removido do carrinho.', 'sucesso');
      carregarCarrinho(); // Recarrega tudo
    } catch (err) {
      console.error(err);
      window.toast(err.message || 'Erro ao remover item.', 'erro');
    }
  }

  async function finalizarCompra() {
    try {
      await window.apiFetch(`/api/carrinho/usuario/${usuarioLogado.id}`, { method: 'DELETE' });
      window.toast('Compra finalizada! Obrigado por comprar conosco.', 'sucesso');
      setTimeout(() => (window.location.href = 'produtos.html'), 1200);
    } catch (err) {
      console.error(err);
      window.toast(err.message || 'Erro ao finalizar compra.', 'erro');
    }
  }

  // Expor funções para o HTML inline (onclick, onchange)
  window.atualizarQuantidade = atualizarQuantidade;
  window.removerItem = removerItem;
  window.finalizarCompra = finalizarCompra; // ✅ CORREÇÃO: Expor esta função

  // Inicialização
  carregarCarrinho();
  window.atualizarContadorCarrinho();
  
}); // Fim do DOMContentLoaded