// assets/js/index.js

async function carregarDestaques() {
  const destaquesContainer = document.getElementById('destaques');
  if (!destaquesContainer) return;

  try {
    const data = await window.apiFetch('/api/produtos', { method: 'GET' });
    const produtos = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    destaquesContainer.innerHTML = '';
    const itens = produtos.slice(0, 4);

    if (!itens.length) {
      destaquesContainer.innerHTML = '<p style="text-align:center;">Nenhum produto em destaque.</p>';
      return;
    }

    itens.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const imgSrc = p.imagemUrl ? `${window.API_BASE}${p.imagemUrl}` : 'assets/img/placeholder.jpg';
      card.innerHTML = `
        <img src="${imgSrc}" alt="${p.nome}" class="product-img">
        <div class="product-info">
          <h3>${p.nome}</h3>
          <p class="descricao">${p.descricao || ''}</p>
          <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>
          <a class="btn" href="produtos.html">Detalhes</a>
        </div>
      `;
      destaquesContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar destaques:', err);
    destaquesContainer.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar.</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  carregarDestaques();
  // header + contador já são atualizados pelo auth.js
});
