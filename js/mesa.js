// MESA — arrastar a fita, rebobinar, encaixar o conversor, digitalizar e o fim do jogo
"use strict";

const Mesa = {
  // Onde soltar cada objeto (retângulos do canvas)
  alvoDaFita: { x: 1300.5, y: 806.4, largura: 716.8, altura: 384 },
  alvoDoConversor: { x: 0, y: 460.8, largura: 1228.8, altura: 768 },
  // Tela do monitor na arte FundoAbout. O vídeo (4:3) preenche a largura e fica alinhado pelo topo,
  // para o "PLAY" da gravação aparecer; o corte fica só embaixo.
  tela: { x: 544, y: 273, largura: 980, altura: 502 },
  alturaDoVideo: 735,
  inicioVisivel: 0.012,
};

async function abrirMesa(anterior, itens) {
  await Carregador.pronto("mesa");
  const cena = new Cena(CONFIG.ancoraDaSala, FUNDOS.CenarioBaseMesa.posicao);
  // "pedeFita" → "animandoFita" → "pedeRewind" → "rebobinando" → "pedeConversor" → "animandoConversor"
  // → "pedePlay" → "digitizando" → "finalizado"
  let fase = "pedeFita";

  const filmeDaFita = new StopMotion(cena, serie("FitaInserida", 6));
  const conversor = [0, 1].map((i) => peca({ x: 1060.9, y: 798.7, largura: 2416.6, altura: 1812.5, imagem: `ConversorInserido_${i}`, classe: "sem-toque" }));
  conversor.forEach((c) => { c.hidden = true; });
  const rebobinando = peca({ x: 1712.1, y: 927.7, largura: 245.8, altura: 184.3, imagem: "Rewinding", classe: "sem-toque" });
  rebobinando.hidden = true;
  const tecla = (nome, rotulo, x, y, aoClicar) => botao({ x, y, largura: 40.96, altura: 30.72, imagem: nome, rotulo, classe: "tecla", aoClicar });
  const play = tecla("Start", "Play tape", 1470.5, 937, iniciarPlay);
  const rewind = tecla("ReButton", "Rewind", 1382.4, 932.4, iniciarRewind);

  const mesa = camada("", [fundo(cena, "CenarioBaseMesa"), filmeDaFita.elemento, camada("sem-toque recorte", conversor), rebobinando, play, rewind]);
  const avisos = camada("sem-toque");
  const inventario = new Inventario(cena, itens, soltar);
  cena.adicionar(mesa, avisos, inventario.elemento);

  // O vídeo já começa a carregar; sem som (a gravação não tem áudio), para poder tocar sozinho
  const video = document.createElement("video");
  Object.assign(video, { src: "assets/video/VideoDigitalizacao.mp4", muted: true, playsInline: true, preload: "auto" });
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.disablePictureInPicture = true;

  // FRASES
  const frases = {
    Insert: ["**drag** the tape into\nthe VHS player", 1024, 307.2, 624.8],
    Rewind: ["the tape must be rewinded to the beginning", 1658.9, 691.2, 676.9],
    Done: ["Done!", 1740.8, 768, 781],
    Converter: ["the computer needs the converter to read the tape", 696.3, 307.2, 729],
    Play: ["Press play", 983, 322.6, 590.1],
    Digitize: ["Digitization beginning...", 962.6, 384, 798.4],
  };
  function dizer(nome) {
    avisos.replaceChildren();
    if (nome) avisos.append(feedback(cena, ...frases[nome]));
  }

  function mudarFase(nova, frase = "") {
    fase = nova;
    dizer(frase);
    play.disabled = fase !== "pedePlay";
    rewind.disabled = fase !== "pedeRewind";
    play.classList.toggle("brilho", !play.disabled);
    rewind.classList.toggle("brilho", !rewind.disabled);
  }

  // ARRASTO: devolve true se o objeto foi solto no lugar certo, na hora certa
  function soltar(item, p) {
    const dentro = (a) => p.x >= a.x && p.x <= a.x + a.largura && p.y >= a.y && p.y <= a.y + a.altura;
    if (item === "Fita" && fase === "pedeFita" && dentro(Mesa.alvoDaFita)) { inserirFita(); return true; }
    if (item === "Conversor" && fase === "pedeConversor" && dentro(Mesa.alvoDoConversor)) { inserirConversor(); return true; }
    return false;
  }

  function usar(item) {
    itens.delete(item);
    inventario.atualizar();
  }

  async function inserirFita() {
    Vibracao.encaixeFita();
    usar("Fita");
    mudarFase("animandoFita");
    await filmeDaFita.tocar("FitaInserida", [0, 1, 2, 3, 4]);
    filmeDaFita.esconder();
    mudarFase("pedeRewind", "Rewind");
  }

  async function iniciarRewind() {
    mudarFase("rebobinando");
    Vibracao.clique();
    Vibracao.rebobinar(2.4);
    for (let i = 0; i < 6; i++) {
      await cena.esperar(0.4);
      rebobinando.hidden = !rebobinando.hidden;
    }
    rebobinando.hidden = true;
    dizer("Done");
    await cena.esperar(1.5);
    mudarFase("pedeConversor", "Converter");
  }

  async function inserirConversor() {
    Vibracao.clique();
    usar("Conversor");
    mudarFase("animandoConversor");
    conversor[0].hidden = false;
    await cena.esperar(0.2);
    conversor[0].hidden = true;
    conversor[1].hidden = false;
    mudarFase("pedePlay", "Play");
  }

  async function iniciarPlay() {
    Vibracao.clique();
    mudarFase("digitizando", "Digitize");
    await cena.esperar(CONFIG.tempoDoTextoDigitalizacao);

    // Escurece e reaparece no monitor de perto, com o vídeo
    const fade = escuro(1);
    fade.style.zIndex = 150;
    cena.adicionar(fade);
    await aparecer(fade, CONFIG.fadeDoVideo);
    dizer("");
    inventario.elemento.hidden = true;
    const t = Mesa.tela;
    const janela = document.createElement("div");
    janela.className = "janela-do-video";
    Object.assign(janela.style, { left: t.x + "px", top: t.y + "px", width: t.largura + "px", height: t.altura + "px" });
    Object.assign(video.style, { height: Mesa.alturaDoVideo + "px", top: -Mesa.inicioVisivel * Mesa.alturaDoVideo + "px" });
    janela.append(video);
    const monitor = camada("desfocavel", [fundo(cena, "FundoAbout"), janela]);
    mesa.replaceWith(monitor);
    const terminou = new Promise((r) => video.addEventListener("ended", r, { once: true }));
    video.currentTime = 0;
    const tocou = video.play().then(() => true, () => false);
    sumir(fade, CONFIG.fadeDoVideo);

    // O vídeo toca inteiro (com um limite, caso o navegador não consiga tocar)
    await Promise.race([terminou, cena.esperar(CONFIG.duracaoDoVideo + ((await tocou) ? 4 : 0))]);
    fim(monitor);
  }

  // TELA DE FIM
  async function fim(monitor) {
    fase = "finalizado";
    monitor.style.transition = "filter 0.5s ease-in-out";
    monitor.style.filter = "blur(13.9px)";
    const p = postit(3, 1003.5, 645.1, { sombra: false });
    acimaDasFrases(cena, p, { x: 1003.5, y: 645.1 });
    const cumprida = camada("", [p, frasesDeFim(cena, "Mission accomplished", "You've completed all the three tasks", 122.9)]);
    const fundo = escuro(1);
    fundo.style.transition = "opacity 0.6s ease-in-out";
    fundo.style.opacity = "0.3";
    const tudo = camada("", [fundo, cumprida]);
    cena.adicionar(tudo);
    aparecer(tudo, 0.6);

    await cena.esperar(2.6);
    fundo.style.opacity = "0.6";
    const quadro = camada("sem-toque", [quadroComPostits(cena, 4, ["cumprida", "cumprida", "cumprida"], { x: 1024, y: 645.1, largura: 1638.4 })]);
    acimaDasFrases(cena, quadro, { x: 1024, y: 645.1 }, { escala: 0.76, novoCentroY: 555 });
    const menu = botaoDeTexto("Menu", () => { menu.disabled = true; abrirMenu(cena); });
    menu.style.zIndex = 100;
    posicionarNoCantoDeCima(cena, menu);
    const final = camada("", [
      quadro, menu,
      frasesDeFim(cena, "Well done!", "You pushed through every difficulty and helped preserve an important piece of the city’s memory", 122.9),
    ]);
    sumir(cumprida, 0.6);
    cena.adicionar(final);
    aparecer(final, 0.6);
  }

  mudarFase("pedeFita", "Insert");
  await cena.mostrar(anterior);
}
