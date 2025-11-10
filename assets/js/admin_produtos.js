// ===========================================
// ✅ assets/js/admin_produtos.js
// ===========================================

(async function () {
  const usuario = window.getUsuario();
  if (!usuario || usuario.tipoUsuario !== "admin") {
    window.toast("Acesso restrito a administradores.", "erro");
    return (window.location.href = "index.html");
  }

  // ✅ IDs corretos
  const form = document.getElementById("formProduto");
  const lista = document.getElementById("listaAdmin");

  // ===================================================
  // ✅ Carregar produtos
  // ===================================================
  async function carregar() {
    try {
      lista.innerHTML = `<p style="text-align:center;">Carregando...</p>`;

      const data = await window.apiFetch("/api/produtos", { method: "GET" });

      const produtos = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      lista.innerHTML = "";

      if (!produtos.length) {
        lista.innerHTML = "<p>Nenhum produto.</p>";
        return;
      }

      produtos.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const img =
          p.imagemUrl && p.imagemUrl !== ""
            ? `${window.API_BASE}${p.imagemUrl}`.replace(/([^:]\/)\/+/g, "$1")
            : "assets/img/placeholder.jpg";

        card.innerHTML = `
          <img src="${img}" class="product-img" alt="${p.nome}">
          <div class="product-info">
            <h3>${p.nome}</h3>
            <p>${p.descricao || ""}</p>
            <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>

            <button class="btn-editar" data-id="${p.id}">
              Editar
            </button>

            <button class="btn" data-del="${p.id}">
              Excluir
            </button>
          </div>
        `;

        lista.appendChild(card);
      });

      // ✅ Eventos de edição
      document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", () =>
          carregarProdutoParaEdicao(btn.dataset.id)
        );
      });

      // ✅ Eventos de exclusão
      document.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.del;
          if (!confirm("Excluir este produto?")) return;
          try {
            await window.apiFetch(`/api/produtos/${id}`, { method: "DELETE" });
            window.toast("Excluído!", "sucesso");
            carregar();
          } catch (err) {
            window.toast(err.message || "Erro ao excluir.", "erro");
          }
        });
      });
    } catch (err) {
      console.error(err);
      lista.innerHTML = `<p style="color:red">Erro ao carregar.</p>`;
    }
  }

  // ===================================================
  // ✅ Buscar produto para editar
  // ===================================================
  async function carregarProdutoParaEdicao(id) {
    try {
      const p = await window.apiFetch(`/api/produtos/${id}`, {
        method: "GET",
      });

      document.getElementById("produtoId").value = p.id;
      document.getElementById("nome").value = p.nome;
      document.getElementById("descricao").value = p.descricao || "";
      document.getElementById("preco").value = p.preco;
      document.getElementById("categoria").value = p.categoria || "";
      document.getElementById("quantidade").value = p.quantidadeEstoque || 0;

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      window.toast(err.message || "Erro ao carregar produto.", "erro");
    }
  }

  // ===================================================
  // ✅ Criar / Editar produto
  // ===================================================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("nome").value.trim();
    const preco = document.getElementById("preco").value.trim();

    if (!nome || !preco)
      return window.toast("Nome e preço são obrigatórios.", "erro");

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("preco", preco);
    fd.append("descricao", document.getElementById("descricao").value);
    fd.append("categoria", document.getElementById("categoria").value);
    fd.append("quantidadeEstoque", document.getElementById("quantidade").value);

    const imagemFile = document.getElementById("imagem_produto").files[0];
    if (imagemFile) fd.append("imagem", imagemFile);

    try {
      if (id) {
        await window.apiFetch(`/api/produtos/${id}`, {
          method: "PUT",
          body: fd,
          headers: {}, // deixa sem JSON para FormData funcionar
        });
        window.toast("Produto atualizado!", "sucesso");
      } else {
        await window.apiFetch(`/api/produtos`, {
          method: "POST",
          body: fd,
          headers: {},
        });
        window.toast("Produto criado!", "sucesso");
      }

      form.reset();
      document.getElementById("produtoId").value = "";
      carregar();
    } catch (err) {
      console.error(err);
      window.toast(err.message || "Erro ao salvar.", "erro");
    }
  });

  // ===================================================
  // ✅ Inicialização
  // ===================================================
  window.addEventListener("DOMContentLoaded", carregar);
})();
