#!/bin/bash

# Script para desenvolvimento mobile do Meu Assistente Financeiro
# Uso: ./dev-mobile.sh

echo "🚀 Iniciando Meu Assistente Financeiro para desenvolvimento mobile..."
echo ""

# Descobrir IP da máquina
IP=$(hostname -I | awk '{print $1}')
echo "📱 Seu IP é: $IP"
echo ""

# Verificar se a porta 3000 está livre
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 3000 já está em uso!"
    echo "   Parando processos na porta 3000..."
    pkill -f "next dev"
    sleep 2
fi

echo "🌐 Iniciando servidor com acesso externo..."
echo "📱 Acesse do seu celular em: http://$IP:3000"
echo "💻 Acesse localmente em: http://localhost:3000"
echo ""
echo "🔧 Para parar o servidor, pressione Ctrl+C"
echo ""

# Executar o comando de desenvolvimento
npm run dev:mobile
