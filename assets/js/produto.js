const API = 'http://localhost:4000/api';

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function carregarProduto() {
  const id = getIdFromQuery();
  if (!id) return document.getElementById('produtoDetalhe').innerText = 'Produto não informado';
  const res = await fetch(`${API}/produtos/${id}`);
  if (!res.ok) return document.getElementById('produtoDetalhe').innerText = 'Produto não encontrado';
  const p = await res.json();
  document.getElementById('produtoDetalhe').innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px"><img src="${p.imagem_url || 'assets/img/placeholder.jpg'}" style="width:100%;border-radius:12px" /></div>
      <div style="flex:1;min-width:260px">
        <h2>${p.nome}</h2>
        <p style="color:#6b6b6b">${p.categoria || ''}</p>
        <p>${p.descricao || ''}</p>
        <h3>R$ ${parseFloat(p.preco).toFixed(2)}</h3>
        <p>Disponível: ${p.quantidade_em_estoque}</p>
        <button class="btn">Comprar</button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', carregarProduto);
