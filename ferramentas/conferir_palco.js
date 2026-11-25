// Confere a regra do corte em milhares de formatos de tela:  node ferramentas/conferir_palco.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ler = (f) => fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8");
const codigo = ler("config.js") + ler("palco.js").split("// UMA CENA")[0] + "; globalThis.medir = medirPalco; globalThis.C = CONFIG;";
const ctx = vm.createContext({ console }); vm.runInContext(codigo, ctx);
const { medir, C } = ctx;
let telas = 0, pior = { topo: 0, baixo: 0, lado: 0, salto: 0 };
for (const ancora of [C.ancoraDaSala, C.ancoraDoCentro, C.ancoraDoMenu]) {
  let antes = null;
  for (let r = 0.3; r < 4; r += 0.0005) {
    const A = 800, m = medir(A * r, A, ancora);
    telas++;
    pior.topo = Math.max(pior.topo, m.topo);
    pior.baixo = Math.max(pior.baixo, C.altura - m.base);
    pior.lado = Math.max(pior.lado, m.esq);
    if (antes) pior.salto = Math.max(pior.salto, Math.abs(m.topo - antes.topo), Math.abs(m.base - antes.base), Math.abs(m.esq - antes.esq));
    antes = m;
  }
}
console.log(telas, "formatos. Corte máximo (px do canvas):", pior);
