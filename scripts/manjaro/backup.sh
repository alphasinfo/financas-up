#!/bin/bash

# Script de Backup Completo - Finanças UP (Manjaro)
# Sistema: Manjaro Linux (Arch-based)
# Data: 17/10/2025

echo "================================================"
echo "  BACKUP COMPLETO DE CONFIGURAÇÕES"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Criar pasta de backup com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="bkp/backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📁 Criando backup em: $BACKUP_DIR${NC}"
echo ""

# Contador de arquivos
COUNT=0

# Função para fazer backup
backup_file() {
  local source=$1
  local dest=$2
  local label=$3
  
  if [ -f "$source" ]; then
    cp "$source" "$dest"
    echo -e "${GREEN}✅ $label${NC}"
    ((COUNT++))
  else
    echo -e "${YELLOW}⚠️  $label não encontrado${NC}"
  fi
}

# 1. Arquivo .env
backup_file ".env" "$BACKUP_DIR/.env" ".env"

# 2. Arquivo .env.local (se existir)
backup_file ".env.local" "$BACKUP_DIR/.env.local" ".env.local"

# 3. Arquivo .env.supabase (se existir)
backup_file ".env.supabase" "$BACKUP_DIR/.env.supabase" ".env.supabase"

# 4. Prisma schema
backup_file "prisma/schema.prisma" "$BACKUP_DIR/schema.prisma" "prisma/schema.prisma"

# 5. Next config
backup_file "next.config.mjs" "$BACKUP_DIR/next.config.mjs" "next.config.mjs"

# 6. Package.json
backup_file "package.json" "$BACKUP_DIR/package.json" "package.json"

# 7. tsconfig.json
backup_file "tsconfig.json" "$BACKUP_DIR/tsconfig.json" "tsconfig.json"

# 8. tailwind.config.ts
backup_file "tailwind.config.ts" "$BACKUP_DIR/tailwind.config.ts" "tailwind.config.ts"

# 9. Banco de dados local (se existir)
backup_file "prisma/dev.db" "$BACKUP_DIR/dev.db" "prisma/dev.db"

# Finalização
echo ""
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${GREEN}✅ BACKUP COMPLETO REALIZADO!${NC}"
echo ""
echo -e "📊 Estatísticas:"
echo -e "   • Arquivos salvos: ${YELLOW}$COUNT${NC}"
echo -e "   • Localização: ${YELLOW}$BACKUP_DIR${NC}"
echo ""
echo -e "📋 Para restaurar um arquivo:"
echo -e "   ${YELLOW}cp $BACKUP_DIR/[arquivo] .${NC}"
echo ""
echo -e "📋 Para listar backups:"
echo -e "   ${YELLOW}ls -lh bkp/${NC}"
echo ""
