// CONFIGURAÇÃO — todos os valores ajustáveis da versão web ficam aqui.
// As medidas dentro do palco estão em pixels do canvas 2048 × 1536, as mesmas do app.
"use strict";

const CONFIG = {
  // PALCO
  largura: 2048,
  altura: 1536,

  // Corte máximo em telas largas (celular deitado, computador): igual ao do iPhone.
  // 1,25 = aparece do pixel ~89 ao ~1318 do canvas. Nunca corta mais do que isso;
  // o que sobrar de tela vira faixa preta nas laterais.
  zoomMaximo: 1.25,
  corteDoIPhone: 0.29, // 0 = corta tudo embaixo, 0,5 = igual em cima e embaixo
  corteMaximoEmCima: 89.1, // pixels do canvas
  corteMaximoEmbaixo: 218.1,

  // Até este zoom o corte segue o enquadramento do iPad; daí até o zoomMaximo
  // ele passa aos poucos para o enquadramento do iPhone.
  zoomDoIPad: 1.15,

  // Corte máximo nas laterais (telas altas, celular em pé). O armário começa a ~70 px da borda
  // da arte, então corta no máximo ~49 px de cada lado.
  zoomMaximoLateral: 1.05,

  // Enquadramento vertical de cada cena no corte do iPad
  ancoraDaSala: 0.4077,
  ancoraDoCentro: 0.5,
  ancoraDoMenu: 0,

  // LAYOUT COMPACTO (celular): abaixo desta escala (pixels na tela por pixel do canvas)
  limiteCompacto: 0.4,
  toqueMinimo: 44, // área de toque mínima na tela, em pixels
  margemDoCorteInferior: 40, // distância entre textos/botões e a borda de baixo visível
  margemLateralDosTextos: 24,

  // MENU
  fracaoDoAbout: 0.9167, fracaoDoAboutNoIPhone: 0.9215,
  fracaoDoPlay: 0.889, fracaoDoPlayNoIPhone: 0.86,
  meiaAlturaDosBotoesDeTexto: 57,
  mostrarBotaoDeIdioma: true, // "pt · en" no menu

  // ANIMAÇÃO
  duracaoDoQuadro: 0.12, // stop motion

  // VÍDEO FINAL
  duracaoDoVideo: 8.7,
  tempoDoTextoDigitalizacao: 1,
  fadeDoVideo: 0.8,

  // ABOUT: no celular a letra nunca fica menor que isto na tela (o texto se divide em mais telas)
  letraMinimaDoAbout: 13.5,
};
