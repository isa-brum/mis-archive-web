#!/usr/bin/env python3
"""Servidor para jogar e testar no computador (Cmd+Shift+B no VS Code).
Manda o navegador sempre conferir se os arquivos mudaram, para nunca aparecer uma versão antiga."""
import http.server, os, socket, sys, threading, webbrowser

PORTA = 8130
ENDERECO = f"http://localhost:{PORTA}/"


class Arquivos(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, *a):
        pass


class Servidor(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
abrir = "--sem-abrir" not in sys.argv
try:
    servidor = Servidor(("", PORTA), Arquivos)
except OSError:
    print(f"O jogo já está aberto em {ENDERECO}")
    if abrir:
        webbrowser.open(ENDERECO)
    sys.exit()
print(f"Jogo em {ENDERECO}  (Ctrl+C para parar)")
if abrir:
    threading.Timer(0.5, webbrowser.open, [ENDERECO]).start()
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    pass
