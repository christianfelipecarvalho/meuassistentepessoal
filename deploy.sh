#!/bin/bash

# 🚀 Script de Deploy para Vercel
# Facilita o deploy da aplicação para teste mobile

echo "🚀 Iniciando deploy para Vercel..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Fazer build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Corrija os erros antes de continuar."
    exit 1
fi

# Deploy para Vercel
echo "🌐 Fazendo deploy para Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "📱 Agora você pode testar no celular usando a URL fornecida"
    echo "🎤 As permissões de microfone devem funcionar corretamente"
else
    echo "❌ Erro no deploy. Verifique as configurações."
    exit 1
fi
