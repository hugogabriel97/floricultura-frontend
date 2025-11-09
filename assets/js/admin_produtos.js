const formProduto = document.getElementById('formProduto');
const listaAdmin = document.getElementById('listaAdmin');
const produtoId = document.getElementById('produtoId');

const API_URL = 'http://localhost:3000/api/produtos';

// Função para listar produtos
async function listarProdutos() {
  try {
    const res = await fetch(API_URL);
    const produtos = await res.json();

    listaAdmin.innerHTML = produtos.map(p => `
      <div class="product-card">
        <h4>${p.nome}</h4>
        <p>${p.descricao || ''}</p>
        <p>R$ ${parseFloat(p.preco).toFixed(2)}</p>
        <p>Categoria: ${p.categoria || '—'}</p>
        <p>Estoque: ${p.quantidadeEstoque}</p>
        ${p.imagemUrl ? `<img src="http://localhost:3000${p.imagemUrl}" alt="${p.nome}" style="width:100px"/>` : ''}
        <button onclick="editarProduto(${p.id})">Editar</button>
        <button onclick="deletarProduto(${p.id})">Deletar</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
  }
}

// Criar ou atualizar produto
formProduto.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('nome', document.getElementById('nome').value);
  formData.append('descricao', document.getElementById('descricao').value);
  formData.append('preco', parseFloat(document.getElementById('preco').value));
  formData.append('categoria', document.getElementById('categoria').value);
  formData.append('quantidadeEstoque', parseInt(document.getElementById('quantidade').value));

  const fileInput = document.getElementById('imagem_produto');
  if (fileInput.files[0]) formData.append('imagem', fileInput.files[0]);

  let url = API_URL;
  let method = 'POST';
  if (produtoId.value) {
    url = `${API_URL}/${produtoId.value}`;
    method = 'PUT';
  }

  try {
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao salvar produto.');
      return;
    }

    alert(data.message);
    formProduto.reset();
    produtoId.value = '';
    listarProdutos(); // atualiza lista
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto.');
  }
});

// Preenche formulário para edição
function editarProduto(id) {
  const produtoCard = Array.from(listaAdmin.children)
    .find(div => div.querySelector('button').onclick.toString().includes(id));
  if (!produtoCard) return;

  produtoId.value = id;
  document.getElementById('nome').value = produtoCard.querySelector('h4').innerText;
  document.getElementById('descricao').value = produtoCard.querySelectorAll('p')[0].innerText;
  document.getElementById('preco').value = parseFloat(produtoCard.querySelectorAll('p')[1].innerText.replace('R$ ', ''));
  document.getElementById('categoria').value = produtoCard.querySelectorAll('p')[2].innerText.replace('Categoria: ', '');
  document.getElementById('quantidade').value = parseInt(produtoCard.querySelectorAll('p')[3].innerText.replace('Estoque: ', ''));
}

// Deletar produto
async function deletarProduto(id) {
  if (!confirm('Deseja realmente deletar este produto?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    listarProdutos();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    alert('Erro ao deletar produto.');
  }
}

// Inicializa a lista
listarProdutos();