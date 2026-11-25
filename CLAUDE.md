# MIS Archive — versão web

Versão web do jogo MIS Archive, de Isabella Brum. O app (fonte de verdade da arte, dos textos e das posições)
fica em `../MIS Archive` e tem seu próprio `CLAUDE.md`; as regras de lá valem aqui.

- Fale em português e explique de forma simples. Isabella é artista e designer.
- Nunca altere, comprima nem regenere imagens, fontes ou vídeo: `assets/` e `dados/` são gerados por
  `ferramentas/copiar_assets.py` (cópia byte a byte). Se precisar de variação, pergunte antes.
- A forma de jogar não muda. Nunca criar alternativa ao arraste da fita.
- Todo texto novo entra em inglês e pt-BR (`TEXTOS_WEB`, em `js/idioma.js`).
- Sem frameworks nem build: HTML, CSS e JS puros.
- Corte máximo = o do iPhone (`js/config.js`); conferir com `node ferramentas/conferir_palco.js`
  e olhar `ferramentas/telas.html`.
- Altura de linha 0,77: o SwiftUI ignora o lineGap da fonte, o navegador não. Não trocar por `normal`.
- Diferenças de propósito em relação ao app: sem pedido de avaliação; botão "pt en" no menu; o corte muda aos poucos
  com a proporção da janela; no celular em pé aparece um aviso para virar; na Missão 1 a primeira gaveta não é
  clicável (no app ela chama imagens que não existem); na mesa, cada objeto só vale no seu lugar.
