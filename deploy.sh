#!/bin/bash

echo "🚀 Iniciando processo de deploy..."
echo ""

# Verificar se o git está configurado
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erro: Este diretório não é um repositório Git"
    echo "Por favor, inicialize o Git e conecte ao GitHub primeiro:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    echo "git remote add origin https://github.com/seu-usuario/seu-repositorio.git"
    echo "git push -u origin main"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Aviso: Há mudanças não commitadas"
    echo "Deseja fazer commit das mudanças? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Fazendo commit das mudanças..."
        git add .
        git commit -m "Deploy preparation"
    else
        echo "❌ Deploy cancelado. Faça commit das mudanças primeiro."
        exit 1
    fi
fi

# Fazer push para o GitHub
echo "📤 Fazendo push para o GitHub..."
git push origin main

echo ""
echo "✅ Código enviado para o GitHub!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Faça login com sua conta GitHub"
echo "3. Clique em 'New Project'"
echo "4. Selecione este repositório"
echo "5. Configure as variáveis de ambiente:"
echo "   - MONGODB_URI=mongodb+srv://admin:MqD0og0W9vkv93E7@cluster0.50nxaat.mongodb.net/lojabarbearia?retryWrites=true&w=majority&appName=Cluster0"
echo "   - JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789"
echo "   - NODE_ENV=production"
echo "6. Clique em 'Deploy'"
echo ""
echo "🌐 Seu sistema estará disponível em: https://seu-projeto.vercel.app"
echo ""
echo "📱 Para domínio próprio:"
echo "1. Compre um domínio (GoDaddy, Namecheap, etc.)"
echo "2. Configure os DNS apontando para seu projeto Vercel"
echo "3. Adicione o domínio no painel do Vercel" 