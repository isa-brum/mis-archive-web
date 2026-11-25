// QUADRO DE TAREFAS, POST-IT AMPLIADO E POST-IT DE MISSÃO CUMPRIDA
"use strict";

const Postits = {
  // Centro de cada post-it dentro da arte do quadro, em fração da imagem
  centros: {
    1: [[0.250, 0.427], [0.495, 0.438], [0.742, 0.438]],
    2: [[0.251, 0.426], [0.496, 0.429], [0.743, 0.440]],
    3: [[0.248, 0.429], [0.501, 0.432], [0.754, 0.441]],
    4: [[0.248, 0.430], [0.505, 0.432], [0.766, 0.430]],
  },
  // Posição do check em relação ao centro do post-it (largura 860,2), em inglês e em português
  check(tarefa) {
    const pt = Idioma.portugues;
    return {
      1: pt ? [-243.2, -210.3] : [-196.6, -218.6],
      2: pt ? [-233.0, -228.9] : [-184.3, -233.5],
      3: pt ? [-252.1, -197.4] : [-225.3, -215.0],
    }[tarefa];
  },
  largura: 860.2,
  larguraAmpliada: 1080,
};

// Post-it grande, com ou sem check. k = tamanho em relação ao das telas de fim de missão.
function postit(tarefa, x, y, { k = 1, cumprida = true, sombra = true } = {}) {
  const [cx, cy] = Postits.check(tarefa);
  const grupo = camada("sem-toque");
  grupo.append(peca({ x, y, largura: Postits.largura * k, imagem: `Postit${tarefa}incompleto`, classe: sombra ? "sombra-postit" : "" }));
  if (cumprida) {
    grupo.check = peca({ x: x + cx * k, y: y + cy * k, largura: 102.4 * k, imagem: "Check" });
    grupo.append(grupo.check);
  }
  return grupo;
}

// Post-it ampliado no meio da tela; tocar em qualquer lugar fecha
function ampliarPostit(cena, tarefa, cumprida) {
  const el = camada("", [
    escuro(0.6),
    grupoCentral(postit(tarefa, 1024, 768, { k: Postits.larguraAmpliada / Postits.largura, cumprida })),
    botaoDaTela("Close", () => sumir(el, 0.2)),
  ]);
  el.style.zIndex = 200;
  cena.adicionar(el);
  aparecer(el, 0.25);
}

// A imagem do quadro com áreas de toque invisíveis sobre os post-its.
// estados: "cumprida", "ativa" ou "bloqueada" (cadeado: não abre)
function quadroComPostits(cena, numero, estados, { x, y, largura }) {
  const quadro = peca({ x, y, largura, imagem: `TaskBoardIsolado${numero}` });
  Postits.centros[numero].forEach(([fx, fy], i) => {
    if (estados[i] === "bloqueada") return;
    const b = botao({ rotulo: `Task ${i + 1}`, aoClicar: () => ampliarPostit(cena, i + 1, estados[i] === "cumprida") });
    Object.assign(b.style, { left: fx * 100 + "%", top: fy * 100 + "%", width: "18%", height: "28%" });
    quadro.append(b);
  });
  quadro.classList.add("sem-toque");
  quadro.querySelectorAll("button").forEach((b) => { b.style.pointerEvents = "auto"; });
  return quadro;
}

// Quadro de tarefas em tela cheia; tocar fora dos post-its fecha
function telaDoQuadro(cena, numero, estados, aoFechar) {
  return camada("", [
    escuro(0.4),
    botaoDaTela("Close", aoFechar),
    grupoCentral(quadroComPostits(cena, numero, estados, { x: 1024, y: 768, largura: 2048 * 0.9 })),
  ]);
}

// "Missão cumprida": post-it com o check aparecendo, frases embaixo
function missaoCumprida(cena, { tarefa, y, frase, margemInferior, aoFechar }) {
  const p = postit(tarefa, 1024, y);
  acimaDasFrases(cena, p, { x: 1024, y });
  const el = camada("", [escuro(0.6), p, frasesDeFim(cena, "Mission accomplished", frase, margemInferior), botaoDaTela("Continue", aoFechar)]);
  p.check.style.opacity = "0";
  el.animarCheck = () => {
    p.check.style.opacity = "";
    p.check.animate(
      { opacity: [0, 1],
        transform: ["translate(-50%, -50%) scale(0.2)", "translate(-50%, -50%) scale(1)"] },
      { duration: 450, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)" });
  };
  return el;
}
