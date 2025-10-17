#!/bin/bash

# Script para remover console.log de produção (mantém console.error em dev)
# SEGURO: Faz backup antes de modificar
# Data: 17/10/2025

echo "================================================"
echo "  REMOVER CONSOLE.LOG DE PRODUÇÃO"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se está na raiz
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute da raiz do projeto${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Buscando console.log em produção...${NC}"
echo ""

# Contar arquivos com console.log
TOTAL=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | wc -l)
echo -e "${BLUE}📊 Encontrados: ${TOTAL} console.log${NC}"
echo ""

if [ "$TOTAL" -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhum console.log encontrado!${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  Este script vai:${NC}"
echo -e "   1. Fazer backup dos arquivos"
echo -e "   2. Remover console.log de produção"
echo -e "   3. Manter console.error apenas em dev"
echo ""
read -p "Continuar? (s/N): " confirma

if [[ ! "$confirma" =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}❌ Operação cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📦 Criando backup...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="bkp/src-antes-limpeza-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp -r src/ "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup salvo: $BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}🧹 Limpando console.log...${NC}"
CLEANED=0

# Encontrar e processar arquivos
while IFS= read -r arquivo; do
    # Pular se já está protegido por NODE_ENV
    if grep -q "process.env.NODE_ENV.*console" "$arquivo"; then
        continue
    fi
    
    # Remover console.log simples
    sed -i '/^[[:space:]]*console\.log/d' "$arquivo"
    
    # Remover console.log com conteúdo (única linha)
    sed -i '/console\.log(.*);$/d' "$arquivo"
    
    ((CLEANED++))
done < <(grep -rl "console\.log" src/ --include="*.ts" --include="*.tsx")

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ LIMPEZA CONCLUÍDA!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${GREEN}📊 Arquivos processados: ${CLEANED}${NC}"
echo ""
echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
echo -e "   1. ${BLUE}Verificar se tudo funciona:${NC} npm run dev"
echo -e "   2. ${BLUE}Testar o sistema${NC}"
echo -e "   3. ${BLUE}Se algo quebrar:${NC}"
echo -e "      ${YELLOW}cp -r $BACKUP_DIR/src ./${NC}"
echo ""
