// PALCO 4:3 — toda cena é montada num canvas de 2048 × 1536 e escalada inteira para a tela.
// É a lógica do GameStage.swift, com uma diferença: em vez de um valor para o iPad e outro para
// o iPhone, o corte muda aos poucos conforme a proporção da janela, para nada "pular" ao redimensionar.
"use strict";

const limitar = (v, min, max) => Math.min(Math.max(v, min), max);
const misturar = (a, b, t) => a + (b - a) * t;

// Calcula escala, corte e área visível para uma janela de L × A
// posicao: onde a arte fica quando sobra altura. segura: áreas do notch etc., em pixels da tela.
function medirPalco(L, A, ancora, posicao = 0.5, segura = { esq: 0, dir: 0, topo: 0, base: 0 }) {
  const C = CONFIG;
  const encaixar = Math.min(L / C.largura, A / C.altura);
  const preencher = Math.max(L / C.largura, A / C.altura);
  const telaLarga = L / A >= C.largura / C.altura;
  const escala = Math.min(preencher, encaixar * (telaLarga ? C.zoomMaximo : C.zoomMaximoLateral));
  const zoom = escala / encaixar;

  // 0 = enquadramento do iPad, 1 = enquadramento do iPhone
  const k = telaLarga ? limitar((zoom - C.zoomDoIPad) / (C.zoomMaximo - C.zoomDoIPad), 0, 1) : 0;

  const sobraX = L - C.largura * escala;
  const sobraY = A - C.altura * escala;
  let corteSup = 0, corteInf = 0, corteLado = 0;
  if (sobraY < 0) {
    const escondido = -sobraY / escala;
    corteSup = limitar(escondido * misturar(ancora, C.corteDoIPhone, k),
                       escondido - C.corteMaximoEmbaixo, C.corteMaximoEmCima);
    corteInf = escondido - corteSup;
  }
  if (sobraX < 0) corteLado = -sobraX / escala / 2;

  // Tela inteira em pixels do canvas, contando a continuação do cenário
  const dx = sobraX / 2; // continuação e corte laterais sempre centralizados
  const dy = sobraY >= 0 ? sobraY * posicao : -corteSup * escala;
  const tela = { esq: -dx / escala, dir: (L - dx) / escala, topo: -dy / escala, base: (A - dy) / escala };
  // Canto da tela com uma margem, sem entrar embaixo do notch
  const canto = (margem) => ({
    esq: tela.esq + Math.max(margem, segura.esq / escala), dir: tela.dir - Math.max(margem, segura.dir / escala),
    topo: tela.topo + Math.max(margem, segura.topo / escala), base: tela.base - Math.max(margem, segura.base / escala),
  });

  return {
    escala, k, corteInf, dx, dy, tela, canto,
    // Parte da arte que aparece na tela
    esq: corteLado, dir: C.largura - corteLado,
    topo: corteSup, base: C.altura - corteInf,
    larguraVisivel: C.largura - 2 * corteLado,
    // Encolhe papéis e quadros que ocupam quase toda a largura quando as laterais são cortadas
    fator: (C.largura - 2 * corteLado) / C.largura,
    // Leva o centro do canvas ao centro da área visível
    ajusteCentro: (corteSup - corteInf) / 2,
    toque: C.toqueMinimo / escala,
    compacto: escala < C.limiteCompacto,
  };
}

// Áreas do notch e da barra de gestos
function areaSegura() {
  const e = getComputedStyle(document.getElementById("area-segura"));
  const n = (v) => parseFloat(v) || 0;
  return { esq: n(e.paddingLeft), dir: n(e.paddingRight), topo: n(e.paddingTop), base: n(e.paddingBottom) };
}

// UMA CENA: palco escalado, que preenche a tela
class Cena {
  static vivas = new Set();

  constructor(ancora = CONFIG.ancoraDoCentro, posicao = 0.5) {
    this.ancora = ancora;
    this.posicao = posicao;
    this.viva = true;
    this.ouvintes = [];
    this.elemento = document.createElement("section");
    this.elemento.className = "cena";
    this.palco = document.createElement("div");
    this.palco.className = "palco";
    this.elemento.append(this.palco);
    Cena.vivas.add(this);
    this.medir();
  }

  medir() {
    const tela = document.getElementById("tela");
    const m = this.m = medirPalco(tela.clientWidth || innerWidth, tela.clientHeight || innerHeight, this.ancora, this.posicao, areaSegura());
    this.palco.style.transform = `translate(${m.dx}px, ${m.dy}px) scale(${m.escala})`;
    this.palco.style.setProperty("--toque", m.toque + "px");
    this.palco.style.setProperty("--ajuste-centro", m.ajusteCentro + "px");
    this.palco.style.setProperty("--fator", m.fator);
    for (const f of this.ouvintes) f(m);
  }

  // Roda agora e de novo sempre que a janela mudar de tamanho
  aoMedir(funcao) {
    this.ouvintes.push(funcao);
    funcao(this.m);
  }

  adicionar(...elementos) {
    this.palco.append(...elementos);
    return elementos[0];
  }

  // Espera que nunca termina se a cena já saiu da tela (as sequências de tempo param sozinhas)
  esperar(segundos) {
    return new Promise((r) => setTimeout(() => { if (this.viva) r(); }, segundos * 1000));
  }

  // A cena nova aparece por cima da anterior, que só sai quando o fade termina
  async mostrar(anterior, duracao = 0.6) {
    anterior?.elemento.setAttribute("inert", "");
    document.getElementById("tela").append(this.elemento);
    this.elemento.style.opacity = "0";
    this.medir();
    // Espera as imagens visíveis estarem prontas (no máximo 5 s)
    const imagens = [...this.palco.querySelectorAll("img:not([data-quadro])")];
    await Promise.race([
      Promise.all(imagens.map((i) => i.decode().catch(() => {}))),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
    this.medir();
    this.elemento.style.opacity = "";
    const fim = await aparecer(this.elemento, duracao);
    anterior?.destruir();
    return fim;
  }

  destruir() {
    this.viva = false;
    Cena.vivas.delete(this);
    this.ouvintes = [];
    this.elemento.remove();
  }
}

// FADES
function animar(el, quadros, duracao, curva = "ease-in-out") {
  const a = el.animate(quadros, { duration: duracao * 1000, easing: curva, fill: "both" });
  // Se a aba ficar escondida a animação pode parar: o tempo garante que o jogo siga
  return Promise.race([a.finished.catch(() => {}), new Promise((r) => setTimeout(r, duracao * 1000 + 250))]);
}
async function aparecer(el, duracao = 0.35) {
  await animar(el, { opacity: [0, 1] }, duracao);
  el.getAnimations().forEach((a) => a.cancel());
}
async function sumir(el, duracao = 0.35) {
  el.setAttribute("inert", "");
  await animar(el, { opacity: [1, 0] }, duracao);
  el.remove();
}
