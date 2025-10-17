#!/bin/bash
echo "🔄 Alternando para LOCAL..."
mkdir -p bkp
[ -f .env ] && cp .env bkp/.env.supabase.bkp && echo "✅ Backup Supabase salvo"
if [ -f bkp/.env.local.bkp ]; then
  cp bkp/.env.local.bkp .env
  echo "✅ Configuração Local ativada!"
  echo ""
  echo "⚠️  Reinicie o servidor:"
  echo "   Ctrl+C"
  echo "   rm -rf .next"
  echo "   npm run dev"
else
  echo "❌ Backup local não encontrado: bkp/.env.local.bkp"
  echo "   Execute primeiro: ./usar-supabase.sh"
  exit 1
fi
