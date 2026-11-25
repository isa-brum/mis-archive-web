#!/usr/bin/env python3
"""
Copia a arte do app (projeto Xcode) para a versão web, SEM alterar nada nos arquivos:
imagens, fontes e vídeo são copiados byte a byte.

Também gera, a partir do catálogo do app:
  dados/textos.js   todos os textos do Localizable.xcstrings (inglês e pt-BR)
  dados/cores.js    as cores nomeadas (aparência clara)
  dados/imagens.js  nome da imagem → arquivo em inglês / em português

Rode de novo sempre que a arte ou os textos do app mudarem:
    python3 ferramentas/copiar_assets.py
Se o projeto do app estiver em outro lugar, passe o caminho:
    python3 ferramentas/copiar_assets.py "/caminho/para/MIS Archive"
"""
import json
import shutil
import sys
import unicodedata
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
PROJETO = Path(sys.argv[1]) if len(sys.argv) > 1 else WEB.parent / "MIS Archive"
APP = PROJETO / "MIS Archive"
CATALOGO = APP / "Assets.xcassets"
IMAGENS = WEB / "assets" / "imagens"
FONTES = WEB / "assets" / "fontes"
VIDEO = WEB / "assets" / "video"
DADOS = WEB / "dados"


def sem_acento(nome):
    """Nome de arquivo sem acento: alguns servidores não acham "CenárioBaseMesa.jpg"."""
    return unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()


def copiar_imagens():
    IMAGENS.mkdir(parents=True, exist_ok=True)
    lista = {}
    for pasta in sorted(CATALOGO.rglob("*.imageset")):
        if "solidimagestack" in str(pasta):  # ícone do visionOS, não é do jogo
            continue
        nome = sem_acento(pasta.stem)
        conteudo = json.loads((pasta / "Contents.json").read_text())
        for img in conteudo.get("images", []):
            arquivo = img.get("filename")
            if not arquivo:
                continue
            pt = img.get("locale") == "pt-BR"
            destino = nome + (".pt-BR" if pt else "") + Path(arquivo).suffix.lower()
            shutil.copyfile(pasta / arquivo, IMAGENS / destino)
            lista.setdefault(nome, {})["pt" if pt else "en"] = destino
    shutil.copyfile(CATALOGO / "AppIcon.appiconset" / "AppIcon.jpg", IMAGENS / "AppIcon.jpg")
    return lista


def copiar_fontes_e_video():
    FONTES.mkdir(parents=True, exist_ok=True)
    VIDEO.mkdir(parents=True, exist_ok=True)
    for arquivo in (APP / "Resources").iterdir():
        destino = {".otf": FONTES, ".mp4": VIDEO}.get(arquivo.suffix.lower())
        if destino:
            shutil.copyfile(arquivo, destino / arquivo.name)


def gerar_textos():
    """A chave é o texto em inglês, como no app. Onde o app muda "toque"/"clique" por aparelho,
    ficam as duas versões e o jogo escolhe pela tela (toque) ou pelo mouse (clique)."""
    catalogo = json.loads((APP / "Localizable.xcstrings").read_text())
    textos = {}
    for chave, entrada in catalogo["strings"].items():
        locs = entrada.get("localizations", {})
        item = {"en": locs.get("en", {}).get("stringUnit", {}).get("value", chave)}
        pt = locs.get("pt-BR", {})
        if "stringUnit" in pt:
            item["pt"] = pt["stringUnit"]["value"]
        elif "device" in pt.get("variations", {}):
            aparelhos = pt["variations"]["device"]
            item["ptToque"] = aparelhos["iphone"]["stringUnit"]["value"]
            item["ptClique"] = aparelhos["mac"]["stringUnit"]["value"]
        if len(item) > 1:  # sem tradução = texto que o jogo não usa
            textos[chave] = item
    return textos


def gerar_cores():
    cores = {}
    for pasta in sorted(CATALOGO.rglob("*.colorset")):
        for c in json.loads((pasta / "Contents.json").read_text()).get("colors", []):
            if "appearances" in c or "color" not in c:
                continue
            comp = c["color"]["components"]
            r, g, b = (round(float(comp[k]) * 255) for k in ("red", "green", "blue"))
            cores[pasta.stem] = f"rgba({r}, {g}, {b}, {float(comp['alpha'])})"
    return cores


def escrever(arquivo, variavel, dados):
    DADOS.mkdir(exist_ok=True)
    (DADOS / arquivo).write_text(
        "// Gerado por ferramentas/copiar_assets.py a partir do app. Não edite à mão.\n"
        f"window.{variavel} = {json.dumps(dados, ensure_ascii=False, indent=1)};\n"
    )


if __name__ == "__main__":
    imagens = copiar_imagens()
    copiar_fontes_e_video()
    escrever("imagens.js", "IMAGENS", imagens)
    escrever("textos.js", "TEXTOS", gerar_textos())
    escrever("cores.js", "CORES", gerar_cores())
    print(f"{len(imagens)} imagens, fontes, vídeo, textos e cores copiados.")
