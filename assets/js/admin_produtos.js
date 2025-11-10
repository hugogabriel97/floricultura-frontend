// ===========================================
// ✅ assets/js/admin_produtos.js
// ===========================================

(async function () {
  // 🔐 Garantir que é ADMIN
  // (Esta verificação agora funciona, pois 'auth.js' foi carregado)
  const usuario = window.getUsuario();
  if (!usuario || usuario.tipoUsuario !== "admin") {
    window.toast("Acesso restrito a administradores.", "erro");
    return (window.location.href = "index.html");
  }

  const form = document.getElementById("formProduto");
  const lista = document.getElementById("listaAdmin");
  const inputId = document.getElementById("produtoId");
  const btnSalvar = document.getElementById("btnSalvar"); // Botão de salvar

  // ===================================================
  // ✅ Carregar lista de produtos
  // ===================================================
  async function carregarProdutos() {
    try {
      lista.innerHTML = `<p style="text-align:center;">Carregando...</p>`;

      // 'apiFetch' funciona para GET simples e já usa a URL base correta
      const produtos = await window.apiFetch("/api/produtos", { method: "GET" });

      lista.innerHTML = "";

      if (!Array.isArray(produtos) || !produtos.length) {
        lista.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        return;
      }
      
      // Corrige URL da imagem (aponta para o 'base' do backend, sem o /api)
      const apiBaseSemApi = window.API_BASE.replace('/api', '');

      produtos.forEach((p) => {
        const img = p.imagemUrl
          ? `${apiBaseSemApi}${p.imagemUrl}` // Ex: https://backend.com/uploads/img.png
          : "assets/img/placeholder.jpg";

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${img}" class="product-img" alt="${p.nome}">
          <div class="product-info">
            <h3>${p.nome}</h3>
            <p>${p.descricao || ""}</p>
            <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>

            <button class="btn-editar" data-id="${p.id}">
              ✏️ Editar
            </button>

            <button class="btn" data-del="${p.id}">
              🗑 Excluir
            </button>
          </div>
        `;

        lista.appendChild(card);
      });

      // ✅ evento editar
      document.querySelectorAll(".btn-editar").forEach((btn) =>
        btn.addEventListener("click", () => {
          carregarProdutoPorId(btn.dataset.id);
        })
      );

      // ✅ evento excluir
      document.querySelectorAll("[data-del]").forEach((btn) =>
        btn.addEventListener("click", async () => {
          const id = btn.dataset.del;
          if (!confirm("Excluir este produto?")) return;
          try {
            // 'apiFetch' funciona para DELETE
            await window.apiFetch(`/api/produtos/${id}`, {
              method: "DELETE",
            });
            window.toast("Produto removido!", "sucesso");
            carregarProdutos(); // Recarrega a lista
          } catch (err) {
            window.toast(err.message || "Erro ao excluir.", "erro");
          }
        })
      );
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      lista.innerHTML = `<p style="color:red">Erro ao carregar produtos.</p>`;
    }
  }

  // ===================================================
  // ✅ Preencher form ao editar
  // ===================================================
  async function carregarProdutoPorId(id) {
    try {
      const p = await window.apiFetch(`/api/produtos/${id}`, { method: "GET" });

      inputId.value = p.id;
      document.getElementById("nome").value = p.nome;
      document.getElementById("descricao").value = p.descricao || "";
      document.getElementById("preco").value = p.preco;
      document.getElementById("categoria").value = p.categoria || "";
      document.getElementById("quantidade").value = p.quantidadeEstoque || 0;
      document.getElementById("imagem_produto").value = ""; // Limpa o campo de arquivo

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Erro ao carregar produto:", err);
      window.toast(err.message || "Erro ao carregar produto.", "erro");
    }
  }

  // ===================================================
  // ✅ Salvar (criar + editar)
  // ===================================================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const nome = document.getElementById("nome").value.trim();
    const preco = document.getElementById("preco").value.trim();

    if (!nome || !preco) {
      return window.toast("Nome e preço são obrigatórios.", "erro");
    }

    // 1. Montar o FormData
    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("preco", preco);
    fd.append("descricao", document.getElementById("descricao").value);
    fd.append("categoria", document.getElementById("categoria").value);
    fd.append("quantidadeEstoque", document.getElementById("quantidade").value);

    const imagemFile = document.getElementById("imagem_produto").files[0];
    if (imagemFile) fd.append("imagem", imagemFile);

    // Desabilita o botão
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
      // O 'fetch' nativo é necessário para FormData
      const token = window.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`
        // Sem 'Content-Type'
      };

      // ✅ CORREÇÃO CRÍTICA:
      // O '/api/' estava faltando na URL do 'fetch' nativo.
      // (window.API_BASE não inclui o /api, mas window.apiFetch sim)
      // Esta URL agora está correta.
      const url = id 
        ? `${window.API_BASE}/api/produtos/${id}` 
        : `${window.API_BASE}/api/produtos`;

      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: fd,
        headers: headers
      });

      const data = await res.json();
      if (!res.ok) {
        // Se a API retornar erro (ex: 400, 500), joga para o catch
        throw new Error(data.message || 'Falha ao salvar produto');
      }
      
      // Sucesso
      window.toast(id ? "Produto atualizado!" : "Produto criado!", "sucesso");
      form.reset();
      inputId.value = "";
      carregarProdutos(); // Recarrega a lista

    } catch (err) {
      console.error("Erro ao salvar:", err);
      // Exibe a mensagem de erro que vem do 'throw new Error'
      window.toast(err.message || "Erro ao salvar produto.", "erro");
    } finally {
      // Reabilita o botão
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar";
    }
  });

  // ===================================================
  // ✅ Inicialização
  // ===================================================
  carregarProdutos();
  
})();