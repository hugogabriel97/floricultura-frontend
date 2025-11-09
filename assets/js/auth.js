// auth.js — controle de sessão e visibilidade do menu

function obterUsuarioLogado() {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

function obterToken() {
  return localStorage.getItem("token");
}

function estaLogado() {
  return !!obterToken();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

function atualizarMenuUsuario() {
  const usuario = obterUsuarioLogado();
  const token = obterToken();

  const usuarioLogado = document.getElementById("usuarioLogado");
  const linkLogin = document.getElementById("linkLogin");
  const linkRegistro = document.getElementById("linkRegistro");
  const btnLogout = document.getElementById("btnLogout");
  const linkCarrinho = document.getElementById("linkCarrinho");

  if (!usuarioLogado || !linkLogin || !linkRegistro) return;

  if (usuario && token) {
    usuarioLogado.textContent = `Olá, ${usuario.nome || "Usuário"}!`;
    usuarioLogado.style.display = "inline-block";
    linkLogin.style.display = "none";
    linkRegistro.style.display = "none";

    if (btnLogout) btnLogout.style.display = "inline-block";
    if (linkCarrinho) linkCarrinho.style.display = "inline-block";

    // 🔹 Atualiza contador do carrinho quando o usuário está logado
    if (typeof atualizarContadorCarrinho === "function") {
      atualizarContadorCarrinho();
    }
  } else {
    usuarioLogado.style.display = "none";
    linkLogin.style.display = "inline-block";
    linkRegistro.style.display = "inline-block";

    if (btnLogout) btnLogout.style.display = "none";
    if (linkCarrinho) linkCarrinho.style.display = "none";
  }

  if (btnLogout) {
    btnLogout.removeEventListener("click", logout);
    btnLogout.addEventListener("click", logout);
  }
}

document.addEventListener("DOMContentLoaded", atualizarMenuUsuario);
