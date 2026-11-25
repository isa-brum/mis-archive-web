// Para testar (usado em telas.html): clica e arrasta no jogo em pixels do canvas, como uma pessoa faria.
// O clique vai para o que estiver de fato por cima naquele ponto.
function jogador(w) {
  const cena = () => [...w.eval("Cena.vivas")].at(-1);
  const ponto = (x, y) => {
    const m = cena().m;
    return { clientX: m.dx + x * m.escala, clientY: m.dy + y * m.escala };
  };
  const alvo = (p) => w.document.elementFromPoint(p.clientX, p.clientY);
  const evento = (el, tipo, p) => el.dispatchEvent(new w.PointerEvent(tipo, { ...p, pointerId: 1, bubbles: true, cancelable: true, button: 0, isPrimary: true }));
  w.eval("Element.prototype.setPointerCapture = function () {}");
  return {
    cena,
    clicar(x, y) {
      const p = ponto(x, y), el = alvo(p);
      if (!el) return "fora da tela";
      el.dispatchEvent(new w.MouseEvent("click", { ...p, bubbles: true, cancelable: true }));
      return (el.getAttribute("aria-label") || el.className || el.tagName) + (el.disabled ? " (desligado)" : "");
    },
    clicarRotulo(rotulo) {
      const b = [...w.document.querySelectorAll(`[aria-label="${rotulo}"]`)].filter((e) => e.offsetParent && !e.closest("[inert]")).at(-1);
      if (!b) return "não achei " + rotulo;
      const r = b.getBoundingClientRect();
      const p = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
      const el = alvo(p);
      el?.dispatchEvent(new w.MouseEvent("click", { ...p, bubbles: true, cancelable: true }));
      return el === b || b.contains(el) ? "ok " + rotulo : "por cima: " + (el?.getAttribute("aria-label") || el?.className || "nada");
    },
    async arrastar(nome, x, y) {
      const el = [...w.document.querySelectorAll(".objeto")].filter((e) => !e.hidden && e.getAttribute("aria-label") === nome).at(-1);
      if (!el) return "não achei " + nome;
      const r = el.getBoundingClientRect();
      const de = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, para = ponto(x, y);
      const topo = alvo(de);
      if (topo !== el) return "por cima do objeto: " + (topo?.className || "nada");
      evento(el, "pointerdown", de);
      for (let t = 0.1; t <= 1; t += 0.1) {
        evento(el, "pointermove", { clientX: de.clientX + (para.clientX - de.clientX) * t, clientY: de.clientY + (para.clientY - de.clientY) * t });
        await new Promise((f) => setTimeout(f, 16));
      }
      evento(el, "pointerup", para);
      return "soltei " + nome;
    },
    async girar(graus) {
      const el = w.document.querySelector(".seletor");
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, raio = r.height * 0.35;
      const p = (g) => ({ clientX: cx + raio * Math.cos(g * Math.PI / 180), clientY: cy + raio * Math.sin(g * Math.PI / 180) });
      const topo = alvo(p(0));
      evento(el, "pointerdown", p(0));
      for (let g = 0; Math.abs(g) <= Math.abs(graus); g += Math.sign(graus) * 5) { evento(el, "pointermove", p(g)); await new Promise((f) => setTimeout(f, 10)); }
      evento(el, "pointerup", p(graus));
      return topo === el ? "girei" : "por cima do seletor: " + topo?.className;
    },
  };
}
