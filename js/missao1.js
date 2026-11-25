// MISSÃO 1 — a sala: introdução, quadro de tarefas e o ar-condicionado quebrado
"use strict";

async function abrirMissao1(anterior) {
  await Carregador.pronto("missao1", "ar");
  const cena = new Cena(CONFIG.ancoraDaSala);
  let overlay = null;
  let dica = null;

  const gaveta = (nome, x, y, l, a) => peca({ x, y, largura: l, altura: a, imagem: nome, classe: "gaveta" });
  const quadro = botao({ x: 1531.9, y: 368.6, largura: 499.7, altura: 374.8, imagem: "TaskBoardCenario1",
                         rotulo: "Task board", classe: "brilho", aoClicar: abrirQuadro });
  const ar = botao({ x: 544.8, y: 284.2, largura: 475.1, altura: 356.4, imagem: "ArQuebradoCenario",
                     rotulo: "Air conditioner", aoClicar: () => abrirAr(cena) });
  ar.disabled = true;

  const sala = camada("desfocavel", [
    cheia("CenarioBase"),
    gaveta("GavetaA", 395.3, 645.1, 303.1, 227.3),
    gaveta("GavetaB", 391.2, 875.5, 301.1, 225.8),
    gaveta("GavetaC", 401.4, 1102.8, 325.6, 244.2),
    cheia("LixoCheio"), quadro, ar,
  ]);
  cena.adicionar(sala);

  // Troca o que está por cima da sala, desfocando (ou não) o fundo
  function trocar(novo, desfoque, duracao) {
    if (overlay) sumir(overlay, duracao);
    overlay = novo;
    sala.style.filter = desfoque ? `blur(${desfoque}px)` : "";
    if (novo) { cena.adicionar(novo); aparecer(novo, duracao); }
  }

  function tutorial() {
    const seta = peca({ x: 1187.8, y: 353.3, largura: 102.4, altura: 76.8, imagem: "Seta" });
    seta.style.setProperty("--giro", "25deg");
    dica = camada("sem-toque", [seta, feedback(cena, "Check your\ntask board", 962.6, 384, 480)]);
    sumir(overlay, 0.6);
    overlay = null;
    sala.style.filter = "";
    cena.adicionar(dica);
    aparecer(dica, 0.6);
  }

  function abrirQuadro() {
    dica?.remove();
    dica = null;
    quadro.classList.remove("brilho");
    trocar(telaDoQuadro(cena, 1, ["ativa", "bloqueada", "bloqueada"], () => {
      trocar(null, 0, 0.2);
      ar.disabled = false;
      ar.classList.add("brilho");
    }), 13.9, 0.2);
  }

  trocar(papelIntroducao(cena, () => trocar(papelStaff(cena, tutorial), 8.7, 0.8)), 13.9, 0);
  await cena.mostrar(anterior);
}
