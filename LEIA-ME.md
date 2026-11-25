# MIS Archive — versão web

O jogo em HTML, CSS e JavaScript puros (sem frameworks, sem instalação), com a mesma arte,
os mesmos textos e as mesmas posições do app. Português e inglês.

## Abrir no VS Code

1. **File › Open Folder…** e escolha a pasta `MIS Archive Web`.
2. Aperte **Cmd + Shift + B**. O jogo abre em http://localhost:8123.
   (Ou instale a extensão **Live Server** e clique em **Go Live**, no canto de baixo.)

Para parar: clique na lixeira do terminal.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Corte máximo, margens, tempos, botão de idioma | `js/config.js` |
| Regra do palco e do corte | `js/palco.js` |
| Cores, fontes, brilhos, sombras | `estilo.css` |
| Textos do jogo | vêm do app (`Localizable.xcstrings`) |
| Textos que só existem na web | `js/idioma.js` |
| Cada tela | `js/menu.js`, `about.js`, `missao1.js`, `ar.js`, `missao2.js`, `missao3.js`, `mesa.js` |

## Como a tela se adapta

Toda cena é montada em 2048 × 1536 e escalada inteira. O corte nunca passa do da versão de iPhone:
aparece sempre, no mínimo, do pixel 89 ao 1318 (altura) e do 49 ao 1999 (largura).
O que sobrar de tela vira faixa preta. Textos, botões e inventário se movem para a área visível.

## Idioma

Segue o idioma do navegador; o "pt en" do menu troca e fica guardado.
Links diretos: `index.html?lang=pt` e `index.html?lang=en`.
Para tirar o botão do menu: `mostrarBotaoDeIdioma: false` em `js/config.js`.

## Testar

- Vários formatos de tela juntos: http://localhost:8123/ferramentas/telas.html?lang=pt
- Direto em uma tela: `index.html?cena=missao2` (about, missao1, ar, missao2, missao3, mesa)
- Regra do corte em 22 mil formatos: `node ferramentas/conferir_palco.js`

## Atualizar arte e textos

As imagens, fontes e o vídeo são cópias idênticas do app. Quando mudarem lá:

    python3 ferramentas/copiar_assets.py

## Publicar

É um site estático: basta enviar a pasta inteira (menos `ferramentas/`) para GitHub Pages, Netlify ou
qualquer hospedagem. Cada pessoa baixa ~20 MB em inglês ou ~32 MB em português.
