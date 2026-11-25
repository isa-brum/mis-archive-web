// CARREGADOR — baixa a arte em segundo plano, na ordem em que o jogo precisa dela,
// para nada piscar nem aparecer pela metade.
"use strict";

const serie = (base, n) => Array.from({ length: n }, (_, i) => `${base}_${i}`);

const Carregador = {
  grupos: {
    menu: ["FundoMenu", "TituloMenu", "BotaoPlay"],
    missao1: ["CenarioBase", "GavetaA", "GavetaB", "GavetaC", "LixoCheio", "TaskBoardCenario1", "ArQuebradoCenario",
              "PapelIntroducao", "DesenhoFita", "BotaoSeta", "BotaoOk", "PapelStaff", "Seta",
              "TaskBoardIsolado1", "Postit1incompleto"],
    ar: ["ArTodoQuebrado", "ArQuebrado1", "ArQuebrado2", "ArConsertado", "PapelComentarios", "BotaoAr", "DisplayAr", "Check"],
    missao2: ["ArConsertadoCenario", "TaskBoardCenario2", "LixoCheioClicavel", "FitaColetavel", "ConversorColetavel",
              "Fita", "Conversor", "FitaSilhueta", "TaskBoardIsolado2", "Postit2incompleto",
              ...serie("GavetaAabrindo", 5), ...serie("GavetaBabrindo", 5), ...serie("GavetaBfechando", 4),
              ...serie("GavetaCabrindo", 5), ...serie("GavetaCfechando", 4), ...serie("LixoEsvaziando", 5)],
    missao3: ["TaskBoardCenario3", "TaskBoardIsolado3", "Postit3incompleto"],
    mesa: ["CenarioBaseMesa", ...serie("FitaInserida", 6), ...serie("ConversorInserido", 2), "Rewinding", "Start", "ReButton",
           "FundoAbout", "TaskBoardIsolado4"],
    about: ["FundoAbout", "SetaAbout_E", "SetaAbout_D", ...Array.from({ length: 13 }, (_, i) => `AboutPicture${i + 1}`)],
  },

  imagens: new Map(), // endereço → promessa (guarda a imagem para o navegador não jogar fora)
  guardadas: [],

  baixar(nome) {
    const endereco = imagem(nome);
    if (!this.imagens.has(endereco)) {
      this.imagens.set(endereco, new Promise((pronto) => {
        const i = new Image();
        i.onload = i.onerror = () => pronto();
        i.src = endereco;
        this.guardadas.push(i);
      }));
    }
    return this.imagens.get(endereco);
  },

  grupo(nome) { return Promise.all(this.grupos[nome].map((n) => this.baixar(n))); },

  // Baixa tudo em segundo plano, um grupo de cada vez
  async emOrdem() {
    const idioma = Idioma.atual;
    for (const nome of ["missao1", "ar", "missao2", "missao3", "mesa", "about"]) {
      if (Idioma.atual !== idioma) return; // trocou de idioma: outra fila já começou
      await this.grupo(nome);
    }
  },

  // Antes de abrir uma tela: espera o grupo dela, mostrando a fita enquanto carrega
  async pronto(...nomes) {
    const tudo = Promise.all(nomes.map((n) => this.grupo(n)));
    let aviso = null;
    const relogio = setTimeout(() => {
      aviso = document.createElement("div");
      aviso.className = "carregando";
      document.getElementById("tela").append(aviso);
    }, 250);
    await tudo;
    clearTimeout(relogio);
    aviso?.remove();
  },
};
