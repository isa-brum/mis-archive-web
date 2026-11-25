// PAPÉIS — os bilhetes de texto do jogo.
"use strict";

// Botão de seta (próximo) que vira "ok" na última página
function botaoDePagina({ x, y, larguraSeta, larguraOk, aoClicar }) {
  const el = botao({ x, y, rotulo: "Next", aoClicar });
  el.atualizar = (ultima) => {
    el.replaceChildren(img(ultima ? "BotaoOk" : "BotaoSeta"));
    el.style.width = (ultima ? larguraOk : larguraSeta) + "px";
    el.setAttribute("aria-label", texto(ultima ? "Continue" : "Next"));
  };
  return el;
}

// Introdução da Missão 1: papel grande, 3 páginas
function papelIntroducao(cena, aoTerminar) {
  const paginas = [
    "The **Museum of Image and Sound (MIS)** was created in the late ‘60s to preserve the emerging media of the analog era, which were beyond the technical capacity of traditional museums.",
    "With the transition to the digital age, this guardian of audiovisual memory now faces a new challenge:\n\n**Digitizing** these legacy media to ensure the **information remains accessible** while **preserving** their original physical formats.",
    "However, **MIS** is currently facing serious difficulties due to a lack of resources, and our collection is at risk.\n\n**We need your help to digitize and preserve it!**",
  ];
  let pagina = 0;
  const papel = peca({ x: 1024, y: 768, largura: 2048 * 0.86, imagem: "PapelIntroducao" });
  const fita = peca({ x: 1024 - 52.1, y: 768 - 322.8, largura: 204.8, imagem: "DesenhoFita" });
  const conteudo = peca({ x: 1024, largura: 1232.3, classe: "texto-do-papel" });
  conteudo.style.setProperty("--giro", "-2.4deg");
  const proximo = botaoDePagina({
    x: 1679.4, y: 1059.8, larguraSeta: 133.1, larguraOk: 112.6,
    aoClicar: () => {
      if (pagina === paginas.length - 1) return aoTerminar();
      pagina++;
      mostrar();
    },
  });
  function mostrar() {
    conteudo.innerHTML = textoHTML(paginas[pagina]);
    conteudo.style.top = 768 + (pagina === 0 ? 34.7 : -8.7) + "px";
    fita.hidden = pagina !== 0;
    proximo.atualizar(pagina === paginas.length - 1);
  }
  mostrar();
  return camada("", [escuro(0.4), grupoCentral(papel, fita, conteudo, proximo)]);
}

// "Agora você faz parte do MIS": toque em qualquer lugar para continuar
function papelStaff(cena, aoTerminar) {
  const papel = peca({ x: 1024, y: 768, largura: 2048 * 0.9, imagem: "PapelStaff" });
  const conteudo = peca({ x: 1024, y: 768, largura: 1480, classe: "texto-do-staff" });
  conteudo.innerHTML =
    `<span class="manuscrita">${marcar(texto(" You are now a MIS staff member\n ").trim())}</span>` +
    `<span>${textoHTML("welcome to archive! Complete the missions and help preserving the museum collection")}</span>`;
  return camada("", [escuro(0.5), grupoCentral(papel, conteudo), botaoDaTela("Continue", aoTerminar)]);
}

// Bilhete pequeno de baixo, à direita (introdução das missões 2 e 3)
function bilhete(cena, { paginas, xTexto, yTexto, largura, altura, tamanho, esquerda, xBotao, yBotao, aoTerminar }) {
  let pagina = 0;
  const papel = peca({ x: 1556.5, y: 1182.7, largura: 1024, altura: 768, imagem: "PapelComentarios" });
  const caixa = peca({ x: xTexto, y: yTexto, largura, altura, classe: "comentario" });
  if (esquerda) caixa.style.justifyContent = "flex-start";
  caixa.style.fontSize = tamanho + "px";
  const proximo = botaoDePagina({
    x: xBotao, y: yBotao, larguraSeta: 77.8, larguraOk: 69.6,
    aoClicar: () => {
      if (pagina === paginas.length - 1) return aoTerminar();
      pagina++;
      mostrar();
    },
  });
  function mostrar() {
    caixa.innerHTML = `<div>${textoHTML(paginas[pagina])}</div>`;
    proximo.atualizar(pagina === paginas.length - 1);
  }
  mostrar();
  const grupo = camada("", [papel, caixa, proximo]);
  cena.aoMedir((m) => {
    grupo.style.transform = `translate(${m.dir - CONFIG.largura}px, ${subirDoCorte(m, 1428)}px)`;
  });
  return camada("", [escuro(0.2), grupo]);
}
