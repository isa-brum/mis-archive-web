// MENU
"use strict";

async function abrirMenu(anterior) {
  await Carregador.pronto("menu");
  const cena = new Cena(CONFIG.ancoraDoMenu);

  const titulo = peca({ x: 1024, largura: 2048, altura: 609, imagem: "TituloMenu", rotulo: "MIS Archive" });
  titulo.setAttribute("role", "img");
  cena.aoMedir((m) => {
    titulo.style.setProperty("--escala", 0.9 * m.fator);
    titulo.style.top = misturar(322.1, 362.1, m.k) + "px";
  });

  const jogar = botao({
    x: 1740.8, largura: 614.4, altura: 399.9, imagem: "BotaoPlay", rotulo: "Play",
    aoClicar: async () => {
      Vibracao.leve();
      jogar.disabled = true;
      await abrirMissao1(cena);
    },
  });
  const sobre = botaoDeTexto("About", () => abrirAbout(cena));
  cena.aoMedir((m) => {
    const altura = m.base - m.topo;
    jogar.style.left = 1740.8 - m.esq + "px";
    jogar.style.top = m.topo + altura * misturar(CONFIG.fracaoDoPlay, CONFIG.fracaoDoPlayNoIPhone, m.k) + "px";
    sobre.style.left = 204.8 + m.esq + "px";
    sobre.style.top = m.topo + altura * misturar(CONFIG.fracaoDoAbout, CONFIG.fracaoDoAboutNoIPhone, m.k) + "px";
  });

  cena.adicionar(cheia("FundoMenu"), escuro(0.1), titulo, sobre, jogar);
  if (CONFIG.mostrarBotaoDeIdioma) cena.adicionar(botoesDeIdioma(cena));
  await cena.mostrar(anterior);
  Carregador.emOrdem();
}

// "pt · en": troca o idioma e redesenha o menu
function botoesDeIdioma(cena) {
  const el = document.createElement("div");
  el.className = "idiomas";
  for (const [codigo, nome, rotulo] of [["pt", "pt", "Português"], ["en", "en", "English"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "botao";
    b.textContent = nome;
    b.lang = codigo;
    b.setAttribute("aria-label", rotulo);
    b.setAttribute("aria-pressed", String(Idioma.atual === codigo));
    b.addEventListener("click", () => {
      if (Idioma.atual === codigo) return;
      Idioma.definir(codigo);
      atualizarAvisoDeGirar();
      abrirMenu(cena);
    });
    el.append(b);
  }
  cena.aoMedir((m) => {
    el.style.left = 1740.8 - m.esq + "px";
    el.style.top = m.topo + (m.base - m.topo) * misturar(CONFIG.fracaoDoPlay, CONFIG.fracaoDoPlayNoIPhone, m.k) - 250 + "px";
  });
  return el;
}
