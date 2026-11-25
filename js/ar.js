// AR-CONDICIONADO — consertar as duas aletas e girar o seletor até a temperatura certa
"use strict";

const Seletor = { x: 1564.2, y: 1126.5, passo: 70, ultimoNivel: 2, folga: 10 };

async function abrirAr(anterior) {
  const cena = new Cena(CONFIG.ancoraDoCentro);
  const consertadas = { cima: false, baixo: false };

  // CLOSE-UP: um quadro por estado, com o mesmo zoom e a mesma sombra
  const fotos = {};
  const closeUp = camada("close-do-ar");
  for (const nome of ["ArTodoQuebrado", "ArQuebrado1", "ArQuebrado2", "ArConsertado"]) {
    fotos[nome] = cheia(nome);
    fotos[nome].dataset.quadro = "";
    closeUp.append(fotos[nome]);
  }
  const mostrarFoto = (nome) => {
    for (const [n, f] of Object.entries(fotos)) f.classList.toggle("visivel", n === nome);
  };
  mostrarFoto("ArTodoQuebrado");

  const aletaDeCima = aleta("Upper vent", 589.6, () => {
    consertadas.cima = true;
    mostrarFoto(consertadas.baixo ? "ArConsertado" : "ArQuebrado2");
  });
  const aletaDeBaixo = aleta("Lower vent", 856.2, () => {
    consertadas.baixo = true;
    mostrarFoto(consertadas.cima ? "ArConsertado" : "ArQuebrado1");
  });
  function aleta(rotulo, y, consertar) {
    const el = botao({ x: 1425.4, y, largura: 491.5, altura: 213.3, rotulo, aoClicar: () => {
      Vibracao.ajuste();
      consertar();
      el.remove();
      if (consertadas.cima && consertadas.baixo) ajustarTemperatura();
    } });
    return el;
  }

  const conteudo = camada("desfocavel grupo-do-ar", [closeUp, aletaDeCima, aletaDeBaixo]);
  cena.aoMedir((m) => { conteudo.style.transform = `translateY(${m.ajusteCentro}px)`; });
  cena.adicionar(conteudo);

  // FASE 2: bilhete, display e seletor giratório
  let papel, display;
  async function ajustarTemperatura() {
    const escurecer = escuro(0.2);
    papel = camada("sem-toque", [
      peca({ x: 573.4, y: 0, largura: 1024, altura: 666.5, imagem: "PapelComentarios" }),
      peca({ x: 573.4, y: 0, largura: 694.2, altura: 347.1, classe: "comentario",
             html: `<div>${textoHTML("The collection **must** be kept at a temperature **between 18°C and 22°C** to prevent the proliferation of fungi and insects that can cause deterioration!")}</div>` }),
    ]);
    cena.aoMedir((m) => {
      // Mesma distância da borda de cima visível em todas as telas (o grupo já sobe ajusteCentro)
      const y = m.topo + misturar(346.8, 285, m.k) - m.ajusteCentro;
      papel.style.transform = `translate(${m.esq}px, ${y}px)`;
    });
    display = peca({ x: 1566.7, y: 1036.1, largura: 409.6, imagem: "DisplayAr", classe: "display-do-ar" });

    const sombra = peca({ x: 1564.2 + 24.3, y: 1123.8 - 3.5, largura: 491.5, altura: 213.3, imagem: "BotaoAr", classe: "sombra-do-seletor sem-toque" });
    const seletor = peca({ x: Seletor.x, y: Seletor.y, largura: 319.5, altura: 208.1, imagem: "BotaoAr", classe: "seletor" });
    for (const el of [escurecer, papel, display]) el.style.opacity = "0";
    conteudo.append(escurecer, papel, sombra, display, seletor);

    await cena.esperar(0.3);
    for (const el of [escurecer, papel, display]) { el.style.opacity = ""; aparecer(el, 0.8); }
    girar(seletor);
  }

  // O seletor segue o dedo em volta do centro. Só gira no sentido anti-horário (baixa a temperatura),
  // em passos de 70°, e não volta além do último passo alcançado.
  function girar(seletor) {
    const alvo = seletor.firstChild;
    let nivel = 0, ativo = true, dedo = null, ultimo = null, atual = 0;

    const anguloDoDedo = (e) => {
      const r = seletor.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) / cena.m.escala <= 12) return null; // muito perto do centro o ângulo pula
      return Math.atan2(dy, dx) * 180 / Math.PI;
    };
    const desenhar = (graus, comMola) => {
      alvo.style.transition = comMola ? "transform 0.25s cubic-bezier(0.3, 1.4, 0.5, 1)" : "none";
      alvo.style.transform = `rotate(${graus}deg)`;
    };
    const soltar = () => {
      dedo = ultimo = null;
      desenhar(-Seletor.passo * nivel, true);
    };

    seletor.addEventListener("pointerdown", (e) => {
      if (!ativo || dedo !== null) return;
      e.preventDefault();
      dedo = e.pointerId;
      seletor.setPointerCapture(dedo);
      atual = -Seletor.passo * nivel;
      ultimo = anguloDoDedo(e);
    });
    seletor.addEventListener("pointermove", (e) => {
      if (!ativo || e.pointerId !== dedo) return;
      const a = anguloDoDedo(e);
      if (a === null) return;
      if (ultimo === null) { ultimo = a; return; }
      let delta = a - ultimo;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      ultimo = a;
      atual = limitar(atual + delta, -Seletor.passo * Seletor.ultimoNivel, -Seletor.passo * nivel);
      desenhar(atual, false);
      if (-atual >= Seletor.passo * (nivel + 1) - Seletor.folga) {
        nivel++;
        Vibracao.passo();
        if (nivel === Seletor.ultimoNivel) {
          ativo = false;
          seletor.style.pointerEvents = "none";
          soltar();
          terminar();
        }
      }
    });
    for (const tipo of ["pointerup", "pointercancel"]) {
      seletor.addEventListener(tipo, (e) => { if (e.pointerId === dedo && ativo) soltar(); });
    }
  }

  async function terminar() {
    await cena.esperar(0.8);
    papel.remove();
    display.remove();
    conteudo.style.transition = "filter 0.4s ease-in-out";
    conteudo.style.filter = "blur(17.4px)";
    const fim = missaoCumprida(cena, {
      tarefa: 1, y: 616.2, margemInferior: 163,
      frase: "Fixing the air conditioner wasn’t exactly part of your job but someone had to do it...",
      aoFechar: () => { fim.setAttribute("inert", ""); abrirMissao2(cena); },
    });
    cena.adicionar(fim);
    aparecer(fim, 0.4);
    await cena.esperar(0.25);
    fim.animarCheck();
  }

  await cena.mostrar(anterior, 0.4);
}
