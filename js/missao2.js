// MISSÃO 2 — explorar a sala e achar a fita VHS e o conversor
"use strict";

async function abrirMissao2(anterior) {
  await Carregador.pronto("missao2");
  const cena = new Cena(CONFIG.ancoraDaSala, FUNDOS.CenarioBase.posicao);
  const itens = new Set();
  // "introPapel" → "esperandoQuadro" → "quadro" → "avisoExplorar" → "exploracao" → "concluida"
  let estado = "introPapel";
  let quadroLido = false;
  let avisoNovaTarefa = false;
  let tocando = null; // animação em andamento: "GavetaA", "GavetaB", "GavetaC" ou "Lixo"

  const gaveta = (nome, rotulo, x, y, l, a, aoClicar) =>
    botao({ x, y, largura: l, altura: a, imagem: nome, rotulo, classe: "gaveta", aoClicar });
  const lixoCheio = cheia("LixoCheio");
  const ar = botao({ x: 544.8, y: 284.2, largura: 475.1, altura: 356.4, imagem: "ArConsertadoCenario", rotulo: "Air conditioner",
                     aoClicar: () => avisoPassageiro("Ar") });
  const quadro = botao({ x: 1531.9, y: 368.6, largura: 499.7, altura: 374.8, imagem: "TaskBoardCenario2", rotulo: "Task board",
                         aoClicar: abrirQuadro });
  const gavetaA = gaveta("GavetaA", "Drawer 1", 395.3, 639.0, 303.1, 227.3, abrirGavetaA);
  const gavetaB = gaveta("GavetaB", "Drawer 2", 391.2, 869.4, 301.1, 225.8, () => abrirGavetaComItem("GavetaB"));
  const gavetaC = gaveta("GavetaC", "Drawer 3", 401.4, 1093.6, 325.6, 244.2, () => abrirGavetaComItem("GavetaC"));
  const fita = botao({ x: 499.7, y: 760.3, largura: 294.9, altura: 294.9, imagem: "FitaColetavel", rotulo: "VHS tape",
                       aoClicar: () => coletar("Fita", "GavetaB") });
  const conversor = botao({ x: 462.8, y: 1053.7, largura: 315.4, altura: 315.4, imagem: "ConversorColetavel", rotulo: "Converter",
                            classe: "conversor-coletavel", aoClicar: () => coletar("Conversor", "GavetaC") });
  fita.hidden = conversor.hidden = true;
  const mesa = botao({ x: 1454.1, y: 752.6, largura: 1044.5, altura: 430.1, rotulo: "Desk", aoClicar: () => avisoPassageiro("Mesa") });
  const camadaDaMesa = camada("sem-toque camada-da-mesa", [mesa]);
  const lixo = botao({ x: 772.1, y: 1078.3, largura: 356.4, altura: 267.3, imagem: "LixoCheioClicavel", rotulo: "Trash can",
                       aoClicar: esvaziarLixo });
  const filme = new StopMotion(cena, [
    ...serie("GavetaAabrindo", 5), ...serie("GavetaBabrindo", 5), ...serie("GavetaBfechando", 4),
    ...serie("GavetaCabrindo", 5), ...serie("GavetaCfechando", 4), ...serie("LixoEsvaziando", 5)]);
  const avisos = camada("sem-toque");

  const sala = camada("desfocavel", [
    fundo(cena, "CenarioBase"), lixoCheio, ar, quadro, gavetaA, gavetaB, gavetaC, fita, filme.elemento,
    camadaDaMesa, lixo, conversor, avisos]);
  const inventario = new Inventario(cena, itens);
  inventario.elemento.hidden = true;
  cena.adicionar(sala, inventario.elemento);

  const tudoColetado = () => itens.has("Fita") && itens.has("Conversor");

  // Liga e desliga botões e brilhos conforme o momento do jogo
  function atualizar() {
    const explorando = estado === "exploracao" || estado === "avisoExplorar";
    const livre = explorando && !tocando;
    const regras = [
      [ar, livre && !tudoColetado()],
      [gavetaA, livre && !tudoColetado()],
      [gavetaB, livre && !itens.has("Fita")],
      [gavetaC, livre && !itens.has("Conversor")],
      [lixo, livre && !tudoColetado()],
    ];
    for (const [el, ativo] of regras) {
      el.disabled = !ativo;
      el.classList.toggle("brilho", ativo);
    }
    mesa.disabled = !(livre && !tudoColetado());
    quadro.disabled = !(estado === "esperandoQuadro" || explorando);
    quadro.classList.toggle("brilho", avisoNovaTarefa || estado === "esperandoQuadro");
    // A peça recortada some enquanto a animação dela toca
    gavetaA.style.opacity = tocando === "GavetaA" ? 0 : "";
    gavetaB.style.opacity = tocando === "GavetaB" ? 0 : "";
    gavetaC.style.opacity = tocando === "GavetaC" ? 0 : "";
    lixo.style.opacity = lixoCheio.style.opacity = tocando === "Lixo" ? 0 : "";
    sala.style.filter = estado === "quadro" || estado === "concluida" ? "blur(13.9px)" : "";
    if (explorando === inventario.elemento.hidden) {
      inventario.elemento.hidden = !explorando;
      if (explorando) aparecer(inventario.elemento);
    }
  }

  // FRASES
  const frases = {
    GavetaA: ["wow, that's a lot\nof work...", 614.4, 491.5, 540],
    GavetaB: ["great! you found the vhs tape!\nclick to collect", 491.5, 1305.6, 850.4, { naSombraDaMesa: true }],
    GavetaC: ["nice, you found the converter!\nclick to collect", 491.5, 1351.7, 810, { naSombraDaMesa: true }],
    Mesa: ["Before going there, you need to find the items!", 1433.6, 1075.2, 616.1],
    Ar: ["Old, but it works!\nBetter than nothing...", 983, 322.6, 590.1],
    Lixo: ["Irrecoverable items are discarded to prevent further loss to the collection", 778.2, 1321, 798.4, { naSombraDaMesa: true }],
  };
  let fraseAtual = null, nomeDaFrase = null;
  function dizer(nome) {
    if (fraseAtual) sumir(fraseAtual, 0.8);
    nomeDaFrase = nome;
    fraseAtual = null;
    if (!nome) return;
    fraseAtual = feedback(cena, ...frases[nome]);
    avisos.append(fraseAtual);
    aparecer(fraseAtual, 0.8);
  }
  async function avisoPassageiro(nome) {
    if (nomeDaFrase === nome) return;
    dizer(nome);
    await cena.esperar(3);
    if (nomeDaFrase === nome) dizer(null);
  }

  // ANIMAÇÕES
  const ida = [0, 1, 2, 3, 4], volta = [4, 3, 2, 1, 0];
  async function abrirGavetaA() {
    tocando = "GavetaA"; atualizar();
    await filme.tocar("GavetaAabrindo", ida);
    dizer("GavetaA");
    await cena.esperar(2);
    dizer(null);
    await filme.tocar("GavetaAabrindo", volta);
    parar();
  }
  async function esvaziarLixo() {
    tocando = "Lixo"; atualizar();
    dizer("Lixo");
    await filme.tocar("LixoEsvaziando", ida);
    await cena.esperar(2);
    dizer(null);
    await filme.tocar("LixoEsvaziando", volta);
    parar();
  }
  async function abrirGavetaComItem(nome) {
    tocando = nome; atualizar();
    await filme.tocar(nome + "abrindo", [0, 1, 2, 3]);
    filme.mostrar(nome + "abrindo_4"); // o último quadro e o item aparecem juntos
    (nome === "GavetaB" ? fita : conversor).hidden = false;
    dizer(nome);
  }
  async function coletar(item, nome) {
    Vibracao.leve();
    fita.hidden = conversor.hidden = true;
    itens.add(item);
    inventario.atualizar();
    dizer(null);
    if (tudoColetado()) concluir();
    await filme.tocar(nome + "fechando", [0, 1, 2, 3]);
    parar();
  }
  function parar() {
    filme.esconder();
    tocando = null;
    atualizar();
  }

  // QUADRO, AVISOS E FIM
  let aviso = null;
  function abrirQuadro() {
    const voltarPara = quadroLido ? "exploracao" : "avisoExplorar";
    estado = "quadro";
    aviso?.remove();
    aviso = null;
    atualizar();
    const tela = telaDoQuadro(cena, 2, ["cumprida", "ativa", "bloqueada"], async () => {
      sumir(tela);
      quadroLido = true;
      estado = voltarPara;
      atualizar();
      if (estado === "avisoExplorar") {
        aviso = feedback(cena, "click around to explore the room", 1024, 1336.3, 486, { base: 1380 });
        aviso.style.zIndex = 100;
        const este = aviso;
        cena.adicionar(este);
        aparecer(este);
        await cena.esperar(2);
        if (estado === "avisoExplorar") { estado = "exploracao"; atualizar(); }
        if (este.isConnected) sumir(este, 0.5);
      }
    });
    tela.style.zIndex = 100;
    cena.adicionar(tela);
    aparecer(tela);
  }

  async function concluir() {
    await cena.esperar(0.8);
    estado = "concluida";
    atualizar();
    const fim = missaoCumprida(cena, {
      tarefa: 2, y: 645.1, margemInferior: 122.9,
      frase: "Now comes the biggest challenge: trusting this century-old computer not to crash on us...",
      aoFechar: () => { fim.setAttribute("inert", ""); abrirMissao3(cena); },
    });
    fim.style.zIndex = 100;
    cena.adicionar(fim);
    aparecer(fim);
    fim.animarCheck();
  }

  const intro = bilhete(cena, {
    paginas: [
      "A **rare and important VHS tape** containing footage of the **city in the 1950s** became **moldy** while the air conditioner was broken...",
      "**VHS tapes** store information in an **analog** format using magnetic tape. This type of storage is **very limited** and can **easily degrade**...",
      "For this reason, **you need to digitize** it to **preserve this memory** for future generations!",
    ],
    xTexto: 1540, yTexto: 1175, largura: 660, altura: 360, tamanho: Idioma.portugues ? 66 : 72.9, esquerda: true,
    xBotao: 1925, yBotao: 1325,
    aoTerminar: async () => {
      sumir(intro);
      estado = "esperandoQuadro";
      avisoNovaTarefa = true;
      atualizar();
      const novaTarefa = feedback(cena, "new task available", 1085.4, 368.6, 347.1);
      avisos.append(novaTarefa);
      aparecer(novaTarefa);
      await cena.esperar(2);
      avisoNovaTarefa = false;
      atualizar();
      sumir(novaTarefa);
    },
  });
  intro.style.zIndex = 100;
  cena.adicionar(intro);
  atualizar();
  await cena.mostrar(anterior);
}
