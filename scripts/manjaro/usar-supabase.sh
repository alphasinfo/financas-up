#!/bin/bash
echo "🔄 Alternando para SUPABASE..."
mkdir -p bkp
[ -f .env ] && cp .env bkp/.env.local.bkp && echo "✅ Backup local salvo"

# Procurar backup do Supabase em vários locais
if [ -f bkp/.env.supabase.bkp ]; then
  cp bkp/.env.supabase.bkp .env
  echo "✅ Configuração Supabase ativada!"
elif [ -f .env.supabase.bak ]; then
  cp .env.supabase.bak .env
  cp .env.supabase.bak bkp/.env.supabase.bkp
  echo "✅ Configuração Supabase ativada!"
else
  echo "❌ Arquivo de configuração do Supabase não encontrado"
  echo ""
  echo "📋 Locais procurados:"
  echo "   • bkp/.env.supabase.bkp"
  echo "   • .env.supabase.bak"
  echo ""
  echo "💡 Configure o Supabase manualmente no arquivo .env:"
  echo "   DATABASE_URL=\"postgresql://postgres:[SENHA]@[PROJETO].supabase.co:5432/postgres\""
  exit 1
fi

echo ""
echo "⚠️  Reinicie o servidor:"
echo "   Ctrl+C"
echo "   rm -rf .next"
echo "   npm run dev"
