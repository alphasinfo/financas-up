#!/bin/bash

# Script para fazer backup completo de todos os arquivos de configuração
# Uso: ./scripts/backup-completo.sh

echo "📦 BACKUP COMPLETO DE CONFIGURAÇÕES"
echo ""

# Criar pasta de backup com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="bkp/backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Criando backup em: $BACKUP_DIR"
echo ""

# Contador de arquivos
COUNT=0

# 1. Arquivo .env
if [ -f .env ]; then
  cp .env "$BACKUP_DIR/.env"
  echo "✅ .env"
  ((COUNT++))
else
  echo "⚠️  .env não encontrado"
fi

# 2. Arquivo .env.local (se existir)
if [ -f .env.local ]; then
  cp .env.local "$BACKUP_DIR/.env.local"
  echo "✅ .env.local"
  ((COUNT++))
fi

# 3. Arquivo .env.supabase.bak (se existir)
if [ -f .env.supabase.bak ]; then
  cp .env.supabase.bak "$BACKUP_DIR/.env.supabase.bak"
  echo "✅ .env.supabase.bak"
  ((COUNT++))
fi

# 4. Prisma schema
if [ -f prisma/schema.prisma ]; then
  cp prisma/schema.prisma "$BACKUP_DIR/schema.prisma"
  echo "✅ prisma/schema.prisma"
  ((COUNT++))
fi

# 5. Next config
if [ -f next.config.js ]; then
  cp next.config.js "$BACKUP_DIR/next.config.js"
  echo "✅ next.config.js"
  ((COUNT++))
fi

# 6. Package.json
if [ -f package.json ]; then
  cp package.json "$BACKUP_DIR/package.json"
  echo "✅ package.json"
  ((COUNT++))
fi

# 7. tsconfig.json
if [ -f tsconfig.json ]; then
  cp tsconfig.json "$BACKUP_DIR/tsconfig.json"
  echo "✅ tsconfig.json"
  ((COUNT++))
fi

# 8. tailwind.config.ts
if [ -f tailwind.config.ts ]; then
  cp tailwind.config.ts "$BACKUP_DIR/tailwind.config.ts"
  echo "✅ tailwind.config.ts"
  ((COUNT++))
fi

# 9. Backups atuais da pasta bkp
if [ -f bkp/.env.local.bkp ]; then
  cp bkp/.env.local.bkp "$BACKUP_DIR/.env.local.bkp"
  echo "✅ bkp/.env.local.bkp"
  ((COUNT++))
fi

if [ -f bkp/.env.supabase.bkp ]; then
  cp bkp/.env.supabase.bkp "$BACKUP_DIR/.env.supabase.bkp"
  echo "✅ bkp/.env.supabase.bkp"
  ((COUNT++))
fi

echo ""
echo "============================================================"
echo ""
echo "✅ BACKUP COMPLETO REALIZADO!"
echo ""
echo "📊 Estatísticas:"
echo "   • Arquivos salvos: $COUNT"
echo "   • Localização: $BACKUP_DIR"
echo ""
echo "📋 Para restaurar um arquivo:"
echo "   cp $BACKUP_DIR/[arquivo] ."
echo ""
echo "📋 Para listar backups:"
echo "   ls -lh bkp/"
echo ""
