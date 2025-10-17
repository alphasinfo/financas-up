#!/bin/bash
echo "🔄 Alternando para SUPABASE..."
mkdir -p bkp
[ -f .env ] && cp .env bkp/.env.local.bkp && echo "✅ Backup local salvo"
if [ -f .env.supabase.bak ]; then
  cp .env.supabase.bak .env
  cp .env.supabase.bak bkp/.env.supabase.bkp
  echo "✅ Configuração Supabase ativada!"
  echo ""
  echo "⚠️  Reinicie o servidor:"
  echo "   Ctrl+C"
  echo "   rm -rf .next"
  echo "   npm run dev"
else
  echo "❌ Arquivo .env.supabase.bak não encontrado"
  exit 1
fi
