// INÍCIO
"use strict";

Idioma.iniciar();
let emPe = null;

// Redimensiona todas as cenas vivas quando a janela muda
new ResizeObserver(ajustarTudo).observe(document.getElementById("tela"));
window.addEventListener("resize", ajustarTudo);
window.addEventListener("orientationchange", () => setTimeout(ajustarTudo, 300));
document.addEventListener("visibilitychange", ajustarTudo);
window.addEventListener("pageshow", ajustarTudo);
window.visualViewport?.addEventListener("resize", ajustarTudo);

// O Safari do iPhone às vezes muda o tamanho da página (barras, notch) sem avisar: confere sempre
let tamanhoAnterior = "";
setInterval(() => {
  const t = document.getElementById("tela"), s = areaSegura();
  const agora = [t.clientWidth, t.clientHeight, s.esq, s.dir, s.topo, s.base].join();
  if (agora !== tamanhoAnterior) ajustarTudo();
  tamanhoAnterior = agora;
}, 400);

function ajustarTudo() {
  for (const cena of Cena.vivas) cena.medir();
  atualizarBloqueio();
}

// CELULAR EM PÉ: o jogo fica bloqueado, com o aviso para virar o celular
function atualizarBloqueio() {
  const aviso = document.getElementById("vire");
  aviso.querySelector("strong").textContent = texto("girar");
  aviso.querySelector("span").textContent = texto("trava");
  const agora = ehCelular && innerHeight > innerWidth;
  if (agora === emPe) return;
  emPe = agora;
  aviso.hidden = !agora;
  document.getElementById("tela").toggleAttribute("inert", agora);
  for (const v of document.querySelectorAll("video")) { // o vídeo final espera o celular deitar
    if (agora && !v.paused) { v.pause(); v.dataset.esperando = ""; }
    if (!agora && "esperando" in v.dataset) { v.play(); delete v.dataset.esperando; }
  }
}
atualizarBloqueio();

// Nada de menu de contexto ao segurar o dedo sobre a arte
document.addEventListener("contextmenu", (e) => e.preventDefault());

Promise.all([
  document.fonts.load('40px "Gibi"'), document.fonts.load('700 40px "Gibi"'), document.fonts.load('40px "Manuscrita"'),
]).catch(() => {}).then(() => {
  // Para testar uma tela direto: index.html?cena=missao2
  const telas = {
    about: abrirAbout, missao1: abrirMissao1, ar: abrirAr, missao2: abrirMissao2, missao3: abrirMissao3,
    mesa: (anterior) => abrirMesa(anterior, new Set(["Fita", "Conversor"])),
  };
  const pedida = new URLSearchParams(location.search).get("cena");
  (telas[pedida] || abrirMenu)(null);
});
