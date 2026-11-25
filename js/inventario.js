// INVENTÁRIO — a fita e o conversor no canto de cima, à direita. Os objetos são arrastados.
"use strict";

class Inventario {
  // itens: Set com "Fita" e "Conversor". aoSoltar(item, ponto do canvas) devolve true se o lugar aceitou.
  constructor(cena, itens, aoSoltar = () => false) {
    this.cena = cena;
    this.itens = itens;
    this.aoSoltar = aoSoltar;
    this.elemento = camada("sem-toque");
    this.elemento.style.zIndex = 90;
    this.silhuetas = { Fita: this.silhuetaDaFita(), Conversor: this.silhuetaDoConversor() };
    this.objetos = { Fita: this.objeto("Fita", "VHS tape"), Conversor: this.objeto("Conversor", "Converter") };
    this.elemento.append(this.silhuetas.Fita, this.silhuetas.Conversor, this.objetos.Fita, this.objetos.Conversor);
    this.atualizar(false);
    cena.aoMedir((m) => this.posicionar(m));
  }

  // Silhueta desenhada pela Isabella
  silhuetaDaFita() {
    const el = peca({});
    const s = peca({ x: 0, y: 0, largura: 159.6, imagem: "FitaSilhueta" });
    s.style.setProperty("--giro", "-0.5deg");
    s.style.left = "calc(50% + 1px)";
    s.style.top = "50%";
    el.append(s);
    return el;
  }

  // Silhueta com o formato do próprio objeto: a forma cinza com a borda clara em volta (16 direções)
  silhuetaDoConversor() {
    const el = peca({ largura: 217.1, altura: 162.8, classe: "silhueta" });
    el.style.setProperty("--giro", "12deg");
    for (let i = 0; i <= 16; i++) {
      const forma = img("Conversor", i < 16 ? "forma borda" : "forma miolo");
      const a = (i / 16) * 2 * Math.PI;
      if (i < 16) forma.style.transform = `translate(${4 * Math.cos(a)}px, ${4 * Math.sin(a)}px)`;
      el.append(forma);
    }
    return el;
  }

  objeto(nome, rotulo) {
    const medida = nome === "Fita" ? [237.6, 178.2] : [217.1, 162.8];
    const el = peca({ largura: medida[0], altura: medida[1], imagem: nome, classe: "objeto" });
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", texto(rotulo));
    if (nome === "Conversor") el.style.setProperty("--giro", "12deg");
    this.arrastar(el, nome);
    return el;
  }

  arrastar(el, nome) {
    let inicio = null;
    el.addEventListener("pointerdown", (e) => {
      if (inicio || e.button > 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      inicio = { x: e.clientX, y: e.clientY, id: e.pointerId };
      el.classList.add("arrastando");
    });
    el.addEventListener("pointermove", (e) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      const s = this.cena.m.escala;
      deslocar(el, (e.clientX - inicio.x) / s, (e.clientY - inicio.y) / s);
    });
    const soltar = (e) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      inicio = null;
      el.classList.remove("arrastando");
      const r = this.cena.palco.getBoundingClientRect();
      const s = this.cena.m.escala;
      const ponto = { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
      const aceito = e.type === "pointerup" && this.aoSoltar(nome, ponto);
      if (!aceito) deslocar(el, 0, 0); // errou o lugar: volta para o inventário
    };
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
  }

  // Mostra só os objetos que estão no inventário
  atualizar(comFade = true) {
    for (const [nome, el] of Object.entries(this.objetos)) {
      const tem = this.itens.has(nome);
      const novo = tem && el.hidden && comFade;
      el.hidden = !tem;
      if (novo) aparecer(el, 0.35);
    }
  }

  // Mesma margem em cima e do lado. No celular os objetos ficam um pouco maiores,
  // para caberem no dedo.
  posicionar(m) {
    const margem = m.compacto ? 30 : 52.1;
    const amp = m.compacto ? limitar(40 / (150.4 * m.escala), 1.05, 1.2) : 1;
    const x = m.canto(margem).dir - 79 * amp; // canto da tela, sem entrar embaixo do notch
    const yFita = m.topo + margem + 68.4 * amp;
    const yConversor = yFita + 167 * amp;
    for (const [nome, y] of [["Fita", yFita], ["Conversor", yConversor]]) {
      for (const el of [this.silhuetas[nome], this.objetos[nome]]) {
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.setProperty("--escala", amp);
      }
    }
  }
}
