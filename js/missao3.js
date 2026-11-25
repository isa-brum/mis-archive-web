// MISSÃO 3 — a sala, antes de ir para a mesa
"use strict";

async function abrirMissao3(anterior) {
  await Carregador.pronto("missao3");
  const cena = new Cena(CONFIG.ancoraDaSala);
  const itens = new Set(["Fita", "Conversor"]);
  // "intro" → "esperandoQuadro" → "quadro" → "avisoMesa" → "exploracao"
  let estado = "intro";

  const gaveta = (nome, x, y, l, a) => peca({ x, y, largura: l, altura: a, imagem: nome, classe: "gaveta" });
  const quadro = botao({ x: 1531.9, y: 368.6, largura: 499.7, altura: 374.8, imagem: "TaskBoardCenario3", rotulo: "Task board",
                         aoClicar: abrirQuadro });
  const mesa = botao({ x: 1454.1, y: 752.6, largura: 1044.5, altura: 430.1, rotulo: "Desk", aoClicar: () => {
    mesa.disabled = true;
    abrirMesa(cena, itens);
  } });
  const avisos = camada("sem-toque");
  const sala = camada("desfocavel", [
    cheia("CenarioBase"), cheia("LixoCheio"),
    peca({ x: 544.8, y: 284.2, largura: 475.1, altura: 356.4, imagem: "ArConsertadoCenario" }),
    gaveta("GavetaA", 395.3, 639.0, 303.1, 227.3),
    gaveta("GavetaB", 391.2, 869.4, 301.1, 225.8),
    gaveta("GavetaC", 401.4, 1093.6, 325.6, 244.2),
    quadro, camada("sem-toque camada-da-mesa", [mesa]), avisos]);
  const inventario = new Inventario(cena, itens);
  cena.adicionar(sala, inventario.elemento);

  function atualizar() {
    quadro.disabled = estado !== "esperandoQuadro" && estado !== "exploracao";
    quadro.classList.toggle("brilho", estado === "esperandoQuadro");
    mesa.disabled = estado !== "avisoMesa" && estado !== "exploracao";
    sala.style.filter = estado === "quadro" ? "blur(8.7px)" : "";
    const mostrar = estado !== "quadro";
    if (mostrar === inventario.elemento.hidden) {
      inventario.elemento.hidden = !mostrar;
      if (mostrar) aparecer(inventario.elemento);
    }
  }

  function abrirQuadro() {
    estado = "quadro";
    atualizar();
    const tela = telaDoQuadro(cena, 3, ["cumprida", "cumprida", "ativa"], async () => {
      sumir(tela, 0.5);
      estado = "avisoMesa";
      atualizar();
      await cena.esperar(0.3);
      const aviso = feedback(cena, "go to the desk", 1024, 1321, 694.2, { base: 1365 });
      avisos.append(aviso);
      aparecer(aviso, 0.8);
      await cena.esperar(2.5);
      sumir(aviso);
      estado = "exploracao";
      atualizar();
    });
    tela.style.zIndex = 100;
    cena.adicionar(tela);
    aparecer(tela);
  }

  const intro = bilhete(cena, {
    paginas: ["Now that you've found everything you need, you can finally complete the last task"],
    xTexto: 1556.5, yTexto: 1167.4, largura: 694.2, altura: 347.1, tamanho: 72.9, xBotao: 1904.6, yBotao: 1305.6,
    aoTerminar: () => {
      sumir(intro);
      estado = "esperandoQuadro";
      atualizar();
    },
  });
  intro.style.zIndex = 100;
  cena.adicionar(intro);
  atualizar();
  await cena.mostrar(anterior);
}
