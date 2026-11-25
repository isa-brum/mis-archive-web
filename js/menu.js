// MENU
"use strict";

async function abrirMenu(anterior) {
  await Carregador.pronto("menu");
  const cena = new Cena(CONFIG.ancoraDoMenu, FUNDOS.FundoMenu.posicao);

  const titulo = peca({ x: 1024, largura: 2048, altura: 609, imagem: "TituloMenu", rotulo: "MIS Archive" });
  titulo.setAttribute("role", "img");
  cena.aoMedir((m) => {
    titulo.style.setProperty("--escala", 0.9 * m.fator);
    // Em telas altas o título sobe para o meio da parede. Nas largas, desce só o necessário para
    // o "pt en" do canto não ficar por cima do papel.
    const emPe = Math.max(0, -m.tela.topo) * 0.45;
    const colado = limitar(1 - Math.max(0, -m.tela.esq) / 160, 0, 1);
    titulo.style.top = misturar(322.1, 362.1 + 50 * colado, m.k) - emPe + "px";
  });

  const jogar = botao({
    largura: 614.4 * CONFIG.tamanhoDosBotoes, altura: 399.9 * CONFIG.tamanhoDosBotoes, imagem: "BotaoPlay", rotulo: "Play",
    aoClicar: async () => {
      Vibracao.leve();
      jogar.disabled = true;
      await abrirMissao1(cena);
    },
  });
  const sobre = botaoDeTexto("About", () => abrirAbout(cena));
  sobre.classList.add("pela-esquerda");
  cena.aoMedir((m) => {
    const C = CONFIG, altura = m.base - m.topo, t = C.tamanhoDosBotoes;
    // As mesmas margens de antes até o canto da tela, agora com os botões menores
    jogar.style.left = m.canto(0).dir - 307.2 * t + "px";
    const distanciaDoJogar = altura * (1 - misturar(C.fracaoDoPlay, C.fracaoDoPlayNoIPhone, m.k));
    jogar.style.top = m.canto(0).base - distanciaDoJogar + 152.6 * (1 - t) + "px";
    sobre.style.left = m.canto(C.margemDosCantos).esq + "px";
    sobre.style.top = m.canto(C.margemDosCantos).base - distanciaDaBorda(m) + C.margemDosCantos + "px";
  });

  cena.adicionar(fundo(cena, "FundoMenu"), escuro(0.1), titulo, sobre, jogar);
  if (CONFIG.mostrarBotaoDeIdioma) cena.adicionar(botoesDeIdioma(cena));
  await cena.mostrar(anterior);
  Carregador.emOrdem();
}

// "pt en", no canto de cima, à esquerda: troca o idioma e redesenha o menu
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
    const c = m.canto(CONFIG.margemDosCantos);
    el.style.left = c.esq + "px";
    el.style.top = c.topo - CONFIG.margemDosCantos + misturar(60, distanciaDaBorda(m), m.k) + "px";
  });
  return el;
}
