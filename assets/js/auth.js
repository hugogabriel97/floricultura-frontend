// =====================================
// ✅ assets/js/auth.js
// =====================================
(function () {
  // =========================================================
  // ✅ 1) Descobrir API_BASE automaticamente
  // =========================================================

  const meta = document.querySelector('meta[name="api-base"]');

  let API_BASE =
    (meta && meta.content) ||
    window.API_BASE ||
    (location.hostname.includes("localhost") ||
    location.hostname.includes("127.0.0.1")
      ? "http://localhost:3000"
      : "https://floricultura-backend-production.up.railway.app");

  // Remove barra final se existir
  API_BASE = API_BASE.replace(/\/+$/, "");

  window.API_BASE = API_BASE;
  console.log("🔗 API_BASE =", API_BASE);

  // =========================================================
  // ✅ 2) Helpers de Token e Usuário (localStorage)
  // =========================================================
  const getToken = () => localStorage.getItem("token");

  const setToken = (tk) => {
    if (tk) localStorage.setItem("token", tk);
  };

  const getUsuario = () => {
    try {
      return JSON.parse(localStorage.getItem("usuario"));
    } catch {
      return null;
    }
  };

  const setUsuario = (u) => {
    if (u) localStorage.setItem("usuario", JSON.stringify(u));
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  // =========================================================
  // ✅ 3) API Fetch padrão
  // =========================================================
  async function apiFetch(path, options = {}) {
    const token = getToken();

    let headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Garante que `path` sempre começa com /
    path = path.startsWith("/") ? path : `/${path}`;

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";

    let data;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      data = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const msg = data?.message || data?.error || `Erro HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  // =========================================================
  // ✅ 4) Atualizar interface (header)
  // =========================================================
  function atualizarHeaderUI() {
    const usuario = getUsuario();
    const token = getToken();

    const usuarioLogadoEl = document.getElementById("usuarioLogado");
    const btnLogout = document.getElementById("btnLogout");
    const linkLogin = document.getElementById("linkLogin");
    const linkRegistro = document.getElementById("linkRegistro");
    const linkCarrinho = document.getElementById("linkCarrinho");

    const logado = usuario && token;

    if (logado) {
      if (usuarioLogadoEl) {
        usuarioLogadoEl.textContent = `Olá, ${usuario.nome}`;
        usuarioLogadoEl.style.display = "inline";
      }
      if (btnLogout) btnLogout.style.display = "inline-block";
      if (linkLogin) linkLogin.style.display = "none";
      if (linkRegistro) linkRegistro.style.display = "none";
      if (linkCarrinho) linkCarrinho.style.display = "inline";
    } else {
      if (usuarioLogadoEl) {
        usuarioLogadoEl.textContent = "";
        usuarioLogadoEl.style.display = "none";
      }
      if (btnLogout) btnLogout.style.display = "none";
      if (linkLogin) linkLogin.style.display = "inline";
      if (linkRegistro) linkRegistro.style.display = "inline";
      if (linkCarrinho) linkCarrinho.style.display = "none";
    }

    if (btnLogout) {
      btnLogout.onclick = () => {
        clearAuth();
        atualizarHeaderUI();
        window.location.href = "index.html";
      };
    }
  }

  // =========================================================
  // ✅ 5) Contador do Carrinho
  // =========================================================
  async function atualizarContadorCarrinho() {
    const usuario = getUsuario();
    const contador = document.querySelector("#contador-carrinho");
    if (!usuario || !contador) return;

    try {
      const data = await apiFetch(`/api/carrinho/${usuario.id}`, {
        method: "GET",
      });

      const itens = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const total = itens.reduce(
        (soma, it) => soma + (Number(it.quantidade) || 1),
        0
      );

      contador.textContent = total;
      contador.style.display = total > 0 ? "inline-block" : "none";
    } catch (err) {
      if (contador) contador.style.display = "none";
      console.error("Erro contador carrinho:", err.message);
    }
  }

  // =========================================================
  // ✅ 6) Toast simples
  // =========================================================
  function toast(msg, tipo = "sucesso") {
    const div = document.createElement("div");
    div.textContent = msg;
    div.className = `toast ${tipo}`;
    document.body.appendChild(div);

    setTimeout(() => div.classList.add("show"), 20);
    setTimeout(() => {
      div.classList.remove("show");
      setTimeout(() => div.remove(), 300);
    }, 2500);
  }

  // =========================================================
  // ✅ Expor no global
  // =========================================================
  window.apiFetch = apiFetch;
  window.getUsuario = getUsuario;
  window.setUsuario = setUsuario;
  window.getToken = getToken;
  window.setToken = setToken;
  window.clearAuth = clearAuth;
  window.atualizarHeaderUI = atualizarHeaderUI;
  window.atualizarContadorCarrinho = atualizarContadorCarrinho;
  window.toast = toast;

  // =========================================================
  // ✅ Inicialização automática
  // =========================================================
  window.addEventListener("DOMContentLoaded", () => {
    atualizarHeaderUI();
    atualizarContadorCarrinho();
  });
})();
