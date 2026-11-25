// PEÇAS — como montar elementos no palco. Medidas em pixels do canvas 2048 × 1536.
"use strict";

// Camada do tamanho do canvas
function camada(classe = "", filhos = []) {
  const el = document.createElement("div");
  el.className = ("cheia " + classe).trim();
  el.append(...filhos);
  return el;
}

// Escurecimento do fundo
function escuro(opacidade) {
  const el = camada();
  el.style.background = `rgba(0, 0, 0, ${opacidade})`;
  return el;
}

// <img> simples
function img(nome, classe = "") {
  const el = document.createElement("img");
  el.className = classe;
  el.alt = "";
  el.draggable = false;
  el.decoding = "sync"; // troca de quadro sem piscar
  el.src = imagem(nome);
  return el;
}

// Imagem que cobre o canvas inteiro (fundos e camadas de animação)
const cheia = (nome) => img(nome, "cheia");

// Peça posicionada pelo centro (x, y), como o .position do SwiftUI.
// A imagem cabe inteira na caixa largura × altura, sem distorcer.
function peca({ tag = "div", x, y, largura, altura, imagem: nome, html, classe = "", rotulo, aoClicar } = {}) {
  const el = document.createElement(tag);
  el.className = ("peca " + classe).trim();
  if (x != null) el.style.left = x + "px";
  if (y != null) el.style.top = y + "px";
  if (largura != null) el.style.width = largura + "px";
  if (altura != null) el.style.height = altura + "px";
  if (nome) el.append(img(nome));
  if (html != null) el.insertAdjacentHTML("beforeend", html);
  if (rotulo) el.setAttribute("aria-label", texto(rotulo));
  if (aoClicar) el.addEventListener("click", aoClicar);
  return el;
}

// Botão com área de toque mínima de 44 px na tela
function botao(opcoes) {
  const el = peca({ ...opcoes, tag: "button", classe: "botao " + (opcoes.classe || "") });
  el.type = "button";
  return el;
}

// Botão invisível que cobre a tela toda ("toque em qualquer lugar para continuar")
function botaoDaTela(rotulo, aoClicar) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "botao cheia cobertura";
  el.setAttribute("aria-label", texto(rotulo));
  el.addEventListener("click", aoClicar);
  return el;
}

// Botão de texto sublinhado ("sobre", "menu")
function botaoDeTexto(chave, aoClicar) {
  return botao({ classe: "botao-texto", html: textoHTML(chave), aoClicar });
}

// Deslocamento extra de uma peça, somado à posição
function deslocar(el, dx, dy) {
  el.style.setProperty("--dx", dx + "px");
  el.style.setProperty("--dy", dy + "px");
}

// Grupo com papéis e quadros: fica no meio da área visível e cabe na largura visível
function grupoCentral(...filhos) { return camada("grupo-central", filhos); }

// Quanto subir um elemento que termina em "base" para o corte de baixo não escondê-lo
function subirDoCorte(m, base) {
  if (m.corteInf <= 0) return 0;
  return -Math.max(0, base - (m.base - CONFIG.margemDoCorteInferior));
}

// Texto de feedback do jogo (letra clara com brilho). Nunca sai da área visível.
// naSombraDaMesa: no corte do iPhone o texto vai para a sombra embaixo da mesa, com mais contraste.
function feedback(cena, chave, x, y, largura, { naSombraDaMesa = false, base } = {}) {
  const el = peca({ x, y, classe: "feedback", html: textoHTML(chave) });
  el.setAttribute("role", "status");
  const ajustar = (m) => {
    const w = Math.min(largura, m.larguraVisivel - 2 * CONFIG.margemLateralDosTextos);
    el.style.width = w + "px";
    let cx = x, cy = y;
    if (naSombraDaMesa && m.k > 0.3) { cx = 1455; cy = 1070; }
    cx = limitar(cx, m.esq + CONFIG.margemLateralDosTextos + w / 2, m.dir - CONFIG.margemLateralDosTextos - w / 2);
    cy += subirDoCorte(m, base ?? cy + el.offsetHeight / 2);
    el.style.left = cx + "px";
    el.style.top = cy + "px";
  };
  cena.aoMedir(ajustar);
  requestAnimationFrame(() => ajustar(cena.m)); // de novo quando a altura do texto for conhecida
  return el;
}

// Título e frase de fim de missão, embaixo
function frasesDeFim(cena, titulo, frase, margemInferior) {
  const el = document.createElement("div");
  el.className = "frases-de-fim";
  el.innerHTML = `<strong>${textoHTML(titulo)}</strong><p>${textoHTML(frase)}</p>`;
  cena.aoMedir((m) => {
    el.style.bottom = margemInferior - subirDoCorte(m, CONFIG.altura - margemInferior) + "px";
    el.style.left = m.esq + CONFIG.margemLateralDosTextos + "px";
    el.style.right = CONFIG.largura - m.dir + CONFIG.margemLateralDosTextos + "px";
  });
  return el;
}

// Post-it ou quadro acima das frases: no corte do iPhone fica um pouco menor e mais alto
function acimaDasFrases(cena, grupo, centro, { escala = 0.92, novoCentroY = 545 } = {}) {
  grupo.style.transformOrigin = `${centro.x}px ${centro.y}px`;
  cena.aoMedir((m) => {
    const dy = misturar(0, novoCentroY - centro.y, m.k);
    grupo.style.transform = `translateY(${dy}px) scale(${misturar(1, escala, m.k) * m.fator})`;
  });
}

// "menu" (About e tela final): a mesma distância do topo que o "sobre" tem da base
function posicionarBotaoMenu(cena, el) {
  cena.aoMedir((m) => {
    const C = CONFIG;
    const margem = misturar((m.base - m.topo) * (1 - C.fracaoDoAbout) - C.meiaAlturaDosBotoesDeTexto,
                            C.margemDoCorteInferior, m.k);
    el.style.left = m.esq + 163.8 + "px";
    el.style.top = m.topo + margem + C.meiaAlturaDosBotoesDeTexto + "px";
  });
}

// STOP MOTION: todos os quadros ficam no palco, um visível por vez
class StopMotion {
  constructor(cena, nomes) {
    this.cena = cena;
    this.elemento = camada("sem-toque");
    this.quadros = new Map();
    for (const nome of nomes) {
      const q = cheia(nome);
      q.dataset.quadro = "";
      this.quadros.set(nome, q);
      this.elemento.append(q);
    }
  }
  mostrar(nome) {
    for (const [n, q] of this.quadros) q.classList.toggle("visivel", n === nome);
  }
  esconder() { this.mostrar(null); }
  // Toca os quadros "base_0", "base_1"… na ordem dada
  async tocar(base, indices) {
    for (const i of indices) {
      this.mostrar(`${base}_${i}`);
      await this.cena.esperar(CONFIG.duracaoDoQuadro);
    }
  }
}

// VIBRAÇÃO: só em celulares Android (o navegador do iPhone não deixa páginas vibrarem)
const Vibracao = {
  tocar(padrao) { try { navigator.vibrate?.(padrao); } catch {} },
  passo() { this.tocar(8); },
  leve() { this.tocar(10); },
  ajuste() { this.tocar(14); },
  clique() { this.tocar(12); },
  encaixeFita() { this.tocar(35); },
  // Zumbido fraco: pulsos bem curtos e seguidos
  rebobinar(segundos) { this.tocar(Array.from({ length: Math.round(segundos * 25) }, (_, i) => i % 2 ? 34 : 6)); },
};
