# MIS Archive — versão web

O jogo em HTML, CSS e JavaScript puros (sem frameworks, sem instalação), com a mesma arte,
os mesmos textos e as mesmas posições do app. Português e inglês.

## Abrir no VS Code

1. **File › Open Folder…** e escolha a pasta `MIS Archive Web`.
2. Aperte **Cmd + Shift + B**. O jogo abre em http://localhost:8130.
   (Ou instale a extensão **Live Server** e clique em **Go Live**, no canto de baixo.)

Para parar: clique na lixeira do terminal.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Corte máximo, continuação do cenário, tamanho dos botões, margens, tempos, idioma | `js/config.js` |
| Regra do palco e do corte | `js/palco.js` |
| Cores, fontes, brilhos, sombras | `estilo.css` |
| Textos do jogo | vêm do app (`Localizable.xcstrings`) |
| Textos que só existem na web | `js/idioma.js` |
| Cada tela | `js/menu.js`, `about.js`, `missao1.js`, `ar.js`, `missao2.js`, `missao3.js`, `mesa.js` |

## Como a tela se adapta

Toda cena é montada em 2048 × 1536 e escalada inteira. O corte nunca passa do da versão de iPhone:
aparece sempre, no mínimo, do pixel 89 ao 1318 (altura) e do 49 ao 1999 (largura).
**Computador e tablet:** não há faixas pretas. O que sobrar de tela é preenchido pela continuação do próprio cenário (a beirada lisa da parede,
do chão ou da mesa se estende, escurecendo até a borda; a foto não é cortada nem alterada). Ajustes em `FUNDOS`, no fim
do `js/config.js`. Botões de canto e inventário vão para os cantos da tela, sem entrar embaixo do notch.

**Celular:** valem as regras da versão de iPhone do app (`CONFIG_DO_CELULAR` em `js/config.js`): foto com o corte do iPhone,
faixas pretas nas laterais, botões e inventário dentro da foto. Em pé, o jogo fica bloqueado com o aviso para virar.
Para ver no computador: `index.html?celular=1` numa janela pequena.

## Publicar

Site: https://misarchive.isabellabrum.com (GitHub Pages, repositório `mis-archive-web`; não apague o arquivo `CNAME`).
Antes de enviar, aumente o `?v=` no `index.html`.

## Idioma

Segue o idioma do navegador; o "pt en" (menu, em cima à esquerda) troca e fica guardado.
Links diretos: `index.html?lang=pt` e `index.html?lang=en`.
Para tirar o botão do menu: `mostrarBotaoDeIdioma: false` em `js/config.js`.

## Testar

- Vários formatos de tela juntos: http://localhost:8130/ferramentas/telas.html?lang=pt
- Direto em uma tela: `index.html?cena=missao2` (about, missao1, ar, missao2, missao3, mesa)
- Regra do corte em 22 mil formatos: `node ferramentas/conferir_palco.js`

## Atualizar arte e textos

As imagens, fontes e o vídeo são cópias idênticas do app. Quando mudarem lá:

    python3 ferramentas/copiar_assets.py

## Publicar

É um site estático: basta enviar a pasta inteira (menos `ferramentas/`) para GitHub Pages, Netlify ou
qualquer hospedagem. Cada pessoa baixa ~20 MB em inglês ou ~32 MB em português.
