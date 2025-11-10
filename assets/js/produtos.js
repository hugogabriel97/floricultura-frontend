// =========================================
// ✅ assets/js/produtos.js
// =========================================

const listaProdutos = document.getElementById("listaProdutos");
const btnCadastrar = document.getElementById("btnCadastrarProduto");


// ============================
// ✅ Mostrar botão se Admin
// ============================
function verificarPermissao() {
  const usuario = window.getUsuario();

  if (usuario?.tipoUsuario === "admin") {
    if (btnCadastrar) {
      btnCadastrar.style.display = "inline-block";
      btnCadastrar.onclick = () =>
        (window.location.href = "admin_produtos.html");
    }
  } else {
    if (btnCadastrar) btnCadastrar.style.display = "none";
  }
}


// ============================
// ✅ Carregar Produtos
// ============================
async function carregarProdutos() {
  try {
    listaProdutos.innerHTML = `
      <p style="text-align:center;">Carregando produtos...</p>
    `;

    const produtos = await window.apiFetch("/api/produtos", { method: "GET" });

    // Padroniza possível variação de retorno do backend
    const arr = Array.isArray(produtos)
      ? produtos
      : Array.isArray(produtos?.data)
      ? produtos.data
      : [];

    listaProdutos.innerHTML = "";

    if (!arr.length) {
      listaProdutos.innerHTML = `
        <p style="text-align:center;">Nenhum produto disponível.</p>
      `;
      return;
    }

    arr.forEach((produto) => {
      const card = document.createElement("div");
      card.className = "product-card";

      // Corrige URL da imagem
      const imgSrc = produto.imagemUrl
        ? `${window.API_BASE}${produto.imagemUrl.replace(/^\/+/, "")}`
        : "assets/img/placeholder.jpg";

      const isAdmin = window.getUsuario()?.tipoUsuario === "admin";

      const botao = isAdmin
        ? `
          <button class="btn-editar" onclick="editarProduto(${produto.id})">
            Editar Produto
          </button>
        `
        : `
          <button class="btn-comprar" data-id="${produto.id}">
            Adicionar ao Carrinho
          </button>
        `;

      card.innerHTML = `
        <img src="${imgSrc}" alt="${produto.nome}" class="product-img" />
        <div class="product-info">
          <h3>${produto.nome}</h3>
          <p class="descricao">${produto.descricao || ""}</p>
          <p class="preco">💲 R$ ${Number(produto.preco).toFixed(2)}</p>
          ${botao}
        </div>
      `;

      listaProdutos.appendChild(card);
    });

    habilitarBotoesCarrinho();

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    listaProdutos.innerHTML = `
      <p style="color:red; text-align:center;">
        Erro ao carregar produtos. Verifique o backend.
      </p>
    `;
  }
}


// ============================
// ✅ Add to cart
// ============================
function habilitarBotoesCarrinho() {
  document.querySelectorAll(".btn-comprar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const idProduto = btn.dataset.id;

      try {
        const usuario = window.getUsuario();
        if (!usuario) {
          window.toast("Faça login para adicionar produtos!", "erro");
          setTimeout(() => (window.location.href = "login.html"), 1200);
          return;
        }

        await window.apiFetch("/api/carrinho", {
          method: "POST",
          body: JSON.stringify({
            usuarioId: usuario.id,
            produtoId: idProduto,
            quantidade: 1,
          }),
        });

        btn.textContent = "✅ Adicionado!";
        setTimeout(() => (btn.textContent = "Adicionar ao Carrinho"), 1200);

        window.toast("Produto adicionado ao carrinho!", "sucesso");
        window.atualizarContadorCarrinho();
      } catch (err) {
        console.error(err);
        window.toast(err.message || "Erro ao adicionar produto.", "erro");
      } finally {
        btn.disabled = false;
      }
    });
  });
}


// ============================
// ✅ Editar produto
// ============================
function editarProduto(id) {
  window.location.href = `admin_produtos.html?id=${id}`;
}


// ============================
// ✅ Boot
// ============================
window.addEventListener("DOMContentLoaded", () => {
  verificarPermissao();
  carregarProdutos();
  window.atualizarContadorCarrinho();
});
