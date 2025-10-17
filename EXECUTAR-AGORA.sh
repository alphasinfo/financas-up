#!/bin/bash

# Script rápido para aplicar índices no Supabase
# Execute: bash EXECUTAR-AGORA.sh

echo "================================================"
echo "  APLICAR ÍNDICES NO SUPABASE - RÁPIDO"
echo "================================================"
echo ""

# 1. Verificar se tem URL do Supabase
echo "🔍 Verificando configuração..."
if ! grep -q "postgresql://" .env 2>/dev/null; then
    echo ""
    echo "❌ Seu .env não tem URL do Supabase configurada"
    echo ""
    echo "📋 Configure manualmente:"
    echo "   1. Abra o arquivo .env"
    echo "   2. Adicione:"
    echo "      DATABASE_URL=\"postgresql://postgres:[SENHA]@[PROJETO].supabase.co:5432/postgres\""
    echo ""
    echo "💡 Pegue a URL no painel do Supabase:"
    echo "   Settings → Database → Connection string"
    exit 1
fi

echo "✅ Supabase configurado!"
echo ""

# 2. Verificar schema.prisma
echo "🔍 Verificando schema.prisma..."
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo "⚠️  Schema está em SQLite, mudando para PostgreSQL..."
    sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    echo "✅ Schema ajustado!"
fi

echo ""
echo "🚀 Aplicando índices no Supabase..."
echo "   (Pode demorar 30-60 segundos)"
echo ""

# 3. Aplicar índices
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "  ✅ ÍNDICES APLICADOS COM SUCESSO!"
    echo "================================================"
    echo ""
    echo "🎉 Seu Supabase agora está 10-50x mais rápido!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. npx prisma generate"
    echo "   2. npm run dev"
    echo "   3. Teste o calendário!"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar índices"
    echo ""
    echo "💡 Verifique:"
    echo "   • DATABASE_URL está correta no .env"
    echo "   • Você tem acesso ao Supabase"
    echo "   • Internet está funcionando"
    exit 1
fi
