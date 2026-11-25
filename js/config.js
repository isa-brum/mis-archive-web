// CONFIGURAÇÃO — todos os valores ajustáveis da versão web ficam aqui.
// As medidas dentro do palco estão em pixels do canvas 2048 × 1536, as mesmas do app.
"use strict";

const CONFIG = {
  // PALCO
  largura: 2048,
  altura: 1536,

  // Corte máximo em telas largas (celular deitado, computador): igual ao do iPhone.
  // 1,25 = aparece do pixel ~89 ao ~1318 do canvas. Nunca corta mais do que isso.
  // O que sobrar de tela é preenchido pela continuação do próprio cenário (FUNDOS, no fim).
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
  mostrarBotaoDeIdioma: true, // "pt en" no canto de cima, à esquerda, do menu
  tamanhoDosBotoes: 0.85, // "sobre", "menu" e "jogar" (1 = tamanho do app)
  margemDosCantos: 80, // distância lateral de "sobre", "menu", "pt en" e "jogar" até a borda da tela
  bordaVaziaDoPlay: 0.049, // parte transparente de cada lado da arte do botão jogar
  // Distância do centro de "menu" e "pt en" até o topo da tela
  topoDoMenu: 92, topoDoMenuNoIPhone: 74,
  topoDoIdioma: 52, topoDoIdiomaNoIPhone: 74, // no iPad fica mais alto, para caber acima do papel do título

  // ANIMAÇÃO
  duracaoDoQuadro: 0.12, // stop motion

  // VÍDEO FINAL
  duracaoDoVideo: 8.7,
  tempoDoTextoDigitalizacao: 1,
  fadeDoVideo: 0.8,

  // ABOUT: no celular a letra nunca fica menor que isto na tela (o texto se divide em mais telas)
  letraMinimaDoAbout: 13.5,
};

// CONTINUAÇÃO DO CENÁRIO — quando a tela é mais larga (ou mais alta) que a arte com o corte máximo,
// a beirada lisa da arte (parede, chão, tampo da mesa) se estende até a borda da tela.
// A arte em si não muda nem é cortada. Cada número diz quantos pixels da beirada são usados
// (só a parte sem objetos). "posicao": em telas altas, 0 = arte em cima, 0,5 = no meio, 1 = embaixo.
// "nitido": menos desfoque, para as linhas do tampo da mesa continuarem definidas.
const FUNDOS = {
  FundoMenu:       { esq: 46, dir: 340, topo: 600, base: 6,  posicao: 1 },
  CenarioBase:     { esq: 60, dir: 42,  topo: 460, base: 84, posicao: 0.72 },
  CenarioBaseMesa: { esq: 26, dir: 26,  topo: 440, base: 30, posicao: 0.6, nitido: true },
  FundoAbout:      { esq: 8,  dir: 8,   topo: 130, base: 24, posicao: 0.5 },
};
// CELULAR — as regras da versão de iPhone do app (valem só no celular, sempre deitado):
// a foto com o corte do iPhone, faixas pretas nas laterais, e botões e inventário dentro da foto.
// Estes valores trocam os de cima.
const CONFIG_DO_CELULAR = {
  // "sobre", "menu" e "jogar" seguem a 85%: com a margem igual à do "sobre", o "jogar" inteiro encostaria na gaveta
  margemDosCantos: 100,
  topoDoMenuNoIPhone: 97,
  letraFixaDoAbout: 55,
};
const ladoMaximoDoCelular = 600; // lado menor do aparelho, em pixels (um iPad tem 744 ou mais)

const ESCURO_NA_PONTA = 0.55; // a continuação escurece aos poucos até a borda da tela
