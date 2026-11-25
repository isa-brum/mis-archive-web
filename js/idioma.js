// IDIOMA E TEXTOS
"use strict";

// Segue o idioma do navegador (pt-PT também cai em pt-BR; os outros caem em inglês).
// A escolha feita no menu fica guardada; um link com ?lang=pt ou ?lang=en manda mais que tudo.
const Idioma = {
  atual: "en",
  get portugues() { return this.atual === "pt"; },

  iniciar() {
    const doLink = new URLSearchParams(location.search).get("lang");
    let guardado = null;
    try { guardado = localStorage.getItem("idioma"); } catch {}
    const doNavegador = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
    const escolha = (doLink || guardado || doNavegador).toLowerCase();
    this.definir(escolha.startsWith("pt") ? "pt" : "en", false);
  },

  definir(idioma, guardar = true) {
    this.atual = idioma;
    if (guardar) { try { localStorage.setItem("idioma", idioma); } catch {} }
    document.documentElement.lang = this.portugues ? "pt-BR" : "en";
    document.title = texto("MIS Archive");
  },
};

// Tela de toque (celular, tablet) ou mouse (computador): muda "toque" / "clique"
const telaDeToque = window.matchMedia("(pointer: coarse)").matches;

// Textos que só existem na versão web
const TEXTOS_WEB = {
  "MIS Archive": { en: "MIS Archive", pt: "Arquivo do MIS" },
  "girar": { en: "turn your phone sideways to play on a bigger screen", pt: "vire o celular para jogar em tela maior" },
  // Nomes dos botões para leitores de tela
  "Play": { en: "Play", pt: "Jogar" },
  "Previous": { en: "Previous", pt: "Anterior" },
  "Next": { en: "Next", pt: "Próximo" },
  "Continue": { en: "Continue", pt: "Continuar" },
  "Close": { en: "Close", pt: "Fechar" },
  "Task board": { en: "Task board", pt: "Quadro de tarefas" },
  "Task 1": { en: "Task 1", pt: "Tarefa 1" },
  "Task 2": { en: "Task 2", pt: "Tarefa 2" },
  "Task 3": { en: "Task 3", pt: "Tarefa 3" },
  "Air conditioner": { en: "Air conditioner", pt: "Ar-condicionado" },
  "Upper vent": { en: "Upper vent", pt: "Aleta de cima" },
  "Lower vent": { en: "Lower vent", pt: "Aleta de baixo" },
  "Drawer 1": { en: "Drawer 1", pt: "Gaveta 1" },
  "Drawer 2": { en: "Drawer 2", pt: "Gaveta 2" },
  "Drawer 3": { en: "Drawer 3", pt: "Gaveta 3" },
  "Trash can": { en: "Trash can", pt: "Lixeira" },
  "Desk": { en: "Desk", pt: "Mesa" },
  "VHS tape": { en: "VHS tape", pt: "Fita VHS" },
  "Converter": { en: "Converter", pt: "Conversor" },
  "Rewind": { en: "Rewind", pt: "Rebobinar" },
  "Play tape": { en: "Play", pt: "Play" },
};

// A chave é o texto em inglês, como no app (Localizable.xcstrings)
function texto(chave) {
  const item = window.TEXTOS[chave] || TEXTOS_WEB[chave];
  if (!item) { console.warn("Texto sem tradução:", chave); return chave; }
  if (!Idioma.portugues) return item.en;
  return item.pt ?? (telaDeToque ? item.ptToque : item.ptClique) ?? item.en;
}

// Texto com o markdown do app (**negrito**, *itálico*) e quebras de linha, pronto para o HTML
function textoHTML(chave) { return marcar(texto(chave)); }

function marcar(s) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/gs, "<b>$1</b>")
    .replace(/\*(.+?)\*/gs, "<i>$1</i>")
    .replace(/\n/g, "<br>");
}

// Arquivo da imagem, na variante em português quando ela existe
function imagem(nome) {
  const item = window.IMAGENS[nome];
  if (!item) { console.warn("Imagem não encontrada:", nome); return ""; }
  return "assets/imagens/" + ((Idioma.portugues && item.pt) || item.en);
}

for (const [nome, valor] of Object.entries(window.CORES)) {
  document.documentElement.style.setProperty("--" + nome, valor);
}
