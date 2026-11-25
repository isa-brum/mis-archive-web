// INÍCIO
"use strict";

Idioma.iniciar();
let relogioDoAviso = 0;
let emPe = false;

// Redimensiona todas as cenas vivas quando a janela muda
new ResizeObserver(ajustarTudo).observe(document.getElementById("tela"));
window.addEventListener("resize", ajustarTudo);
window.addEventListener("orientationchange", () => setTimeout(ajustarTudo, 300));
document.addEventListener("visibilitychange", ajustarTudo);
function ajustarTudo() {
  for (const cena of Cena.vivas) cena.medir();
  atualizarAvisoDeGirar();
}

// Celular em pé: sugere virar, em cima do jogo, por alguns segundos (não impede de jogar)
function atualizarAvisoDeGirar() {
  const aviso = document.getElementById("aviso-girar");
  const agora = telaDeToque && innerWidth < 600 && innerHeight > innerWidth * 1.3;
  aviso.textContent = texto("girar");
  if (agora === emPe) return;
  emPe = agora;
  clearTimeout(relogioDoAviso);
  aviso.classList.toggle("visivel", agora);
  if (!agora) return;
  relogioDoAviso = setTimeout(() => aviso.classList.remove("visivel"), 8000);
}
atualizarAvisoDeGirar();

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
