// assets/js/admin_produtos.js
(async function () {
  const usuario = window.getUsuario();
  if (!usuario || usuario.tipoUsuario !== 'admin') {
    window.toast('Acesso restrito a administradores.', 'erro');
    return (window.location.href = 'index.html');
  }

  const form = document.getElementById('formAdminProduto');
  const lista = document.getElementById('listaAdminProdutos');

  async function carregar() {
    try {
      const data = await window.apiFetch('/api/produtos', { method: 'GET' });
      const produtos = Array.isArray(data) ? data : data?.data || [];
      lista.innerHTML = '';
      if (!produtos.length) {
        lista.innerHTML = '<p>Nenhum produto.</p>';
        return;
      }
      produtos.forEach((p) => {
        const li = document.createElement('div');
        li.className = 'product-card';
        const img = p.imagemUrl ? `${window.API_BASE}${p.imagemUrl}` : 'assets/img/placeholder.jpg';
        li.innerHTML = `
          <img src="${img}" class="product-img" alt="${p.nome}">
          <div class="product-info">
            <h3>${p.nome}</h3>
            <p>${p.descricao || ''}</p>
            <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>
            <button class="btn-editar" data-id="${p.id}">Editar</button>
            <button class="btn" data-del="${p.id}">Excluir</button>
          </div>`;
        lista.appendChild(li);
      });

      // excluir
      lista.querySelectorAll('[data-del]').forEach((btn) =>
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-del');
          if (!confirm('Excluir este produto?')) return;
          try {
            await window.apiFetch(`/api/produtos/${id}`, { method: 'DELETE' });
            window.toast('Excluído!', 'sucesso');
            carregar();
          } catch (err) {
            window.toast(err.message || 'Erro ao excluir.', 'erro');
          }
        })
      );
    } catch (err) {
      console.error(err);
      lista.innerHTML = '<p style="color:red">Erro ao carregar.</p>';
    }
  }

  // criação simples sem upload (se usar upload multipart, adapte com FormData)
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const preco = document.getElementById('preco').value.trim();
    if (!nome || !preco) return window.toast('Nome e preço são obrigatórios.', 'erro');

    try {
      await window.apiFetch('/api/produtos', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          preco,
          descricao: document.getElementById('descricao').value.trim(),
          categoria: document.getElementById('categoria').value.trim(),
          quantidadeEstoque: Number(document.getElementById('quantidadeEstoque').value) || 0,
        }),
      });
      window.toast('Produto criado!', 'sucesso');
      form.reset();
      carregar();
    } catch (err) {
      window.toast(err.message || 'Erro ao criar.', 'erro');
    }
  });

  window.addEventListener('DOMContentLoaded', carregar);
})();
