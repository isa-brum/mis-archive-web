// ABOUT — carrossel de fotos do making of na tela do monitor de papelão
"use strict";

const About = {
  textoInteiro: "**Hi, I’m Isa brum!** A Brazilian artist and designer. Inspired by the time I volunteered at the **Museu da Imagem e do Som de Campinas**, this educational stop-motion game explores the preservation of audiovisual memory and the real challenges of underfunded cultural institutions. Every environment was physically built using **cardboard and 3D-printed materials** to emphasize human presence and materiality in an age of automation. More than a game, it is an **artistic investigation** into memory and the dialogue between art and technology.\n*(Historical video and images provided and authorized by MIS Campinas).* \n\n**I hope you enjoy the experience!**",
  // No celular o texto se divide em 2 telas, como no iPhone
  textoDoCelular: [
    "**Hi, I’m Isa brum!** A Brazilian artist and designer. Inspired by the time I volunteered at the **Museu da Imagem e do Som de Campinas**, this educational stop-motion game explores the preservation of audiovisual memory and the real challenges of underfunded cultural institutions. Every environment was physically built using **cardboard and 3D-printed materials** to emphasize human presence and materiality in an age of automation.",
    "More than a game, it is an **artistic investigation** into memory and the dialogue between art and technology.\n*(Historical video and images provided and authorized by MIS Campinas).* \n\n**I hope you enjoy the experience!**",
  ],
  legendas: [
    "The stop-motion set assembled in the studio",
    "Showing the improvised setup created to animate the elements coming out of the drawers, using clay for support",
    "The MIS Campinas archive, the original space that inspired the game (Image provided and authorized by MIS Campinas)",
    "The original digitization room, at MIS Campinas (Image provided and authorized by MIS Campinas)",
    "My first sketched prototype of the game’s set design",
    "The first physical prototype of the stop-motion set miniatures",
    "The template files and set pieces before assembly",
    "The set pieces being cut with the laser machine",
    "The game cassette modeled in Blender and 3D printed",
    "The trash element from the set being 3D printed",
    "Assembling the air conditioner using pins to allow movement",
    "Preparing the miniature Post-its that appear on the task board",
    "The set in the process of being assembled",
  ],
  caixa: { largura: 983, altura: 460.8, margem: 34.7, margemDeCima: 18 },
  letra: 74.6,
  letraDoIPhone: 55,
};

async function abrirAbout(anterior) {
  await Carregador.pronto("about");
  const cena = new Cena(CONFIG.ancoraDaSala, FUNDOS.FundoAbout.posicao);
  let slides = [];
  let atual = 0;
  let trocando = false;

  const menu = botaoDeTexto("Menu", () => abrirMenu(cena));
  posicionarNoCantoDeCima(cena, menu);

  const monitor = peca({ x: 1034.2, y: 525.3, largura: 983, altura: 614.4 });
  const legenda = feedbackDoAbout(cena);

  const esquerda = botao({ x: 286.7, y: 553, largura: 204.8, altura: 153.6, imagem: "SetaAbout_E", rotulo: "Previous",
                           aoClicar: () => irPara(atual - 1) });
  const direita = botao({ x: 1781.8, y: 553, largura: 204.8, altura: 153.6, imagem: "SetaAbout_D", rotulo: "Next",
                          aoClicar: () => irPara(atual + 1) });
  esquerda.style.opacity = direita.style.opacity = "0.85";

  cena.adicionar(fundo(cena, "FundoAbout"), menu, monitor, legenda, esquerda, direita);

  function desenhar() {
    const slide = slides[atual];
    monitor.replaceChildren();
    if (slide.html) monitor.append(caixaDeTexto(slide.html, slide.letra, slide.noTopo));
    if (slide.imagem) {
      const foto = peca({ largura: 962.6, altura: 614.4, imagem: slide.imagem });
      Object.assign(foto.style, { left: "50%", top: "50%", opacity: "0.75" });
      monitor.append(foto);
    }
    legenda.innerHTML = slide.legenda ? textoHTML(slide.legenda) : "";
  }

  async function irPara(i) {
    if (trocando) return;
    trocando = true;
    if (i < 0 || i >= slides.length) { // primeiro ou último: a tela "pisca"
      await animar(monitor, { opacity: [1, 0.3, 1] }, 0.3);
    } else {
      await Promise.all([monitor, legenda].map((el) => animar(el, { opacity: [1, 0] }, 0.15)));
      atual = i;
      desenhar();
      await Promise.all([monitor, legenda].map((el) => animar(el, { opacity: [0, 1] }, 0.15)));
    }
    trocando = false;
  }

  // As telas de texto dependem do tamanho da janela
  let chave = "";
  await document.fonts.ready;
  cena.adicionar();
  cena.palco.style.visibility = "hidden";
  document.getElementById("tela").append(cena.elemento); // precisa estar na página para medir o texto
  cena.aoMedir((m) => {
    const letra = m.compacto ? Math.round(limitar(CONFIG.letraMinimaDoAbout / m.escala, About.letraDoIPhone, About.letra)) : 0;
    if (String(letra) === chave) return;
    const textosAntes = slides.filter((s) => s.html).length;
    chave = String(letra);
    const textos = telasDeTexto(cena, letra);
    slides = [...textos, ...About.legendas.map((l, i) => ({ imagem: `AboutPicture${i + 1}`, legenda: l }))];
    // Continua na mesma foto quando o número de telas de texto muda
    atual = atual >= textosAntes ? atual - textosAntes + textos.length : Math.min(atual, textos.length - 1);
    if (textosAntes === 0) atual = 0;
    desenhar();
  });
  cena.palco.style.visibility = "";

  const teclas = (e) => {
    if (!cena.viva) return document.removeEventListener("keydown", teclas);
    if (e.key === "ArrowRight") irPara(atual + 1);
    if (e.key === "ArrowLeft") irPara(atual - 1);
  };
  document.addEventListener("keydown", teclas);
  await cena.mostrar(anterior);
}

function feedbackDoAbout(cena) {
  const el = peca({ x: 1024, y: 1075.2, classe: "feedback" });
  cena.aoMedir((m) => { el.style.width = Math.min(1638.4, m.larguraVisivel - 2 * CONFIG.margemLateralDosTextos) + "px"; });
  return el;
}

function caixaDeTexto(html, letra, noTopo) {
  const c = About.caixa;
  const el = document.createElement("div");
  el.className = "texto-do-about";
  Object.assign(el.style, {
    left: "0", top: (614.4 - c.altura) / 2 + "px", width: c.largura + "px", height: c.altura + "px",
    padding: `${noTopo ? c.margemDeCima : 0}px ${c.margem}px 0`,
    justifyContent: noTopo ? "flex-start" : "center", fontSize: letra + "px",
  });
  el.innerHTML = `<div>${html}</div>`;
  return el;
}

// Divide o texto em telas. letra = 0: tudo numa tela só, com a letra encolhendo até caber (iPad e
// computador). Senão a letra é fixa: as 2 telas do iPhone se couberem, ou tantas quantas precisar.
function telasDeTexto(cena, letra) {
  const prova = camada();
  prova.style.visibility = "hidden";
  cena.palco.append(prova);
  const cabe = (html, tamanho, noTopo) => {
    const el = caixaDeTexto(html, tamanho, noTopo);
    prova.replaceChildren(el);
    return el.firstChild.offsetHeight <= About.caixa.altura - (noTopo ? About.caixa.margemDeCima : 0);
  };
  let telas;
  if (!letra) {
    const html = textoHTML(About.textoInteiro);
    let t = About.letra;
    while (t > About.letra * 0.3 && !cabe(html, t, false)) t -= 0.5;
    telas = [{ html, letra: t, noTopo: false }];
  } else {
    const doIPhone = About.textoDoCelular.map(textoHTML);
    if (doIPhone.every((h) => cabe(h, letra, true))) {
      telas = doIPhone.map((html) => ({ html, letra, noTopo: true }));
    } else {
      // Corta no fim das frases
      const frases = texto(About.textoInteiro).split(/(?<=[.!?][)*]*)\s+(?=\S)/);
      telas = [];
      let acumulado = "";
      for (const frase of frases) {
        const tentativa = acumulado ? acumulado + " " + frase : frase;
        if (acumulado && !cabe(marcar(tentativa), letra, true)) {
          telas.push({ html: marcar(acumulado), letra, noTopo: true });
          acumulado = frase;
        } else acumulado = tentativa;
      }
      telas.push({ html: marcar(acumulado), letra, noTopo: true });
    }
  }
  prova.remove();
  return telas;
}
