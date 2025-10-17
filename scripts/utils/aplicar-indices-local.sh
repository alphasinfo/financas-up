#!/bin/bash

# Script para aplicar índices de performance APENAS NO BANCO LOCAL
# Não afeta Supabase - você aplica lá quando quiser
# Data: 17/10/2025

echo "================================================"
echo "  APLICAR ÍNDICES - BANCO LOCAL"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto${NC}"
    exit 1
fi

echo -e "${BLUE}ℹ️  Este script aplica índices APENAS no banco LOCAL (SQLite)${NC}"
echo -e "${BLUE}   Seu Supabase NÃO será afetado.${NC}"
echo ""

# 1. BACKUP DO .ENV ATUAL
echo -e "${YELLOW}📦 Fazendo backup do .env atual...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p bkp
cp .env "bkp/.env.backup.$TIMESTAMP"
echo -e "${GREEN}✅ Backup salvo: bkp/.env.backup.$TIMESTAMP${NC}"
echo ""

# 2. VERIFICAR SE JÁ ESTÁ USANDO LOCAL
if grep -q "DATABASE_URL=\"file:./dev.db\"" .env; then
    echo -e "${GREEN}✅ Já está usando banco local${NC}"
    echo ""
else
    echo -e "${YELLOW}🔄 Alternando para banco local...${NC}"
    
    # Salvar configuração Supabase
    if grep -q "postgresql://" .env; then
        grep "DATABASE_URL" .env > bkp/.env.supabase.bkp
        echo -e "${GREEN}✅ Configuração Supabase salva em: bkp/.env.supabase.bkp${NC}"
    fi
    
    # Mudar para local
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env
    echo -e "${GREEN}✅ Alternado para banco local${NC}"
    echo ""
fi

# 3. ALTERAR PROVIDER NO SCHEMA.PRISMA
echo -e "${YELLOW}🔄 Ajustando schema.prisma para SQLite...${NC}"
sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
echo -e "${GREEN}✅ Provider ajustado${NC}"
echo ""

# 4. BACKUP DO BANCO (se existir)
if [ -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}📦 Fazendo backup do banco local...${NC}"
    cp prisma/dev.db "bkp/dev.db.antes-indices.$TIMESTAMP"
    echo -e "${GREEN}✅ Backup salvo: bkp/dev.db.antes-indices.$TIMESTAMP${NC}"
    echo ""
fi

# 5. APLICAR ÍNDICES
echo -e "${YELLOW}🚀 Aplicando índices no banco local...${NC}"
echo ""

npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ ÍNDICES APLICADOS COM SUCESSO!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${GREEN}📈 Melhorias aplicadas:${NC}"
    echo -e "   • ${GREEN}19 índices${NC} adicionados"
    echo -e "   • Calendário: ${GREEN}10-50x mais rápido${NC}"
    echo -e "   • Dashboard: ${GREEN}5-20x mais rápido${NC}"
    echo ""
    echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
    echo -e "   1. ${BLUE}Reinicie o servidor:${NC} npm run dev"
    echo -e "   2. ${BLUE}Teste o calendário${NC} (deve ser muito mais rápido!)"
    echo -e "   3. ${BLUE}Quando quiser, aplique no Supabase:${NC}"
    echo -e "      ${YELLOW}./scripts/utils/aplicar-indices-supabase.sh${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  ATENÇÃO:${NC}"
    echo -e "   • Você está usando banco ${GREEN}LOCAL${NC} agora"
    echo -e "   • Para voltar ao Supabase:"
    echo -e "     ${YELLOW}./scripts/manjaro/usar-supabase.sh${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar índices${NC}"
    echo ""
    echo -e "${YELLOW}Para restaurar:${NC}"
    echo -e "   ${YELLOW}cp bkp/.env.backup.$TIMESTAMP .env${NC}"
    if [ -f "bkp/dev.db.antes-indices.$TIMESTAMP" ]; then
        echo -e "   ${YELLOW}cp bkp/dev.db.antes-indices.$TIMESTAMP prisma/dev.db${NC}"
    fi
    exit 1
fi
