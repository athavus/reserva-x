#!/bin/bash
# Script para iniciar a aplicação no Render ou localmente
# Garante que a aplicação escute em 0.0.0.0 e na porta correta

PORT=${PORT:-8000}
echo "Iniciando aplicação na porta $PORT..."

# Inicia com uvicorn
# --host 0.0.0.0 é fundamental para o Render detectar o processo
# --port $PORT usa a porta dinâmica fornecida pelo Render
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
