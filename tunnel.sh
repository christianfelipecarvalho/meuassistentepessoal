#!/bin/bash

# 🌐 Script para Tunnel Local com ngrok
# Permite testar no celular usando HTTPS local

echo "🌐 Configurando tunnel local com ngrok..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "📦 Instalando ngrok..."
    npm install -g ngrok
fi

# Verificar se a aplicação está rodando
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "🚀 Iniciando aplicação..."
    npm run dev &
    sleep 5
fi

# Criar tunnel
echo "🔗 Criando tunnel HTTPS..."
echo "📱 Use a URL HTTPS fornecida no seu celular"
echo "🎤 As permissões de microfone devem funcionar agora"
echo ""
echo "Pressione Ctrl+C para parar o tunnel"

ngrok http 3000
