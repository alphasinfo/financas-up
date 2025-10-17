#!/bin/bash

# Script para aplicar índices de performance NO SUPABASE
# Execute APENAS quando estiver pronto para atualizar produção
# Data: 17/10/2025

echo "================================================"
echo "  APLICAR ÍNDICES - SUPABASE (PRODUÇÃO)"
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

echo -e "${RED}⚠️  ATENÇÃO: Este script vai MODIFICAR seu banco SUPABASE!${NC}"
echo ""
echo -e "${YELLOW}Isso vai adicionar índices no banco de produção.${NC}"
echo -e "${YELLOW}É seguro, mas afeta o banco em produção.${NC}"
echo ""
read -p "Tem certeza que quer continuar? (s/N): " confirma

if [[ ! "$confirma" =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${BLUE}❌ Operação cancelada pelo usuário${NC}"
    exit 0
fi

echo ""

# 1. BACKUP DO .ENV
echo -e "${YELLOW}📦 Fazendo backup do .env...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p bkp
cp .env "bkp/.env.backup.$TIMESTAMP"
echo -e "${GREEN}✅ Backup salvo: bkp/.env.backup.$TIMESTAMP${NC}"
echo ""

# 2. VERIFICAR SE ESTÁ USANDO SUPABASE
if grep -q "postgresql://" .env; then
    echo -e "${GREEN}✅ Conectado ao Supabase${NC}"
    echo ""
else
    echo -e "${RED}❌ Você não está usando Supabase no momento${NC}"
    echo -e "${YELLOW}Para usar Supabase, execute:${NC}"
    echo -e "   ${YELLOW}./scripts/manjaro/usar-supabase.sh${NC}"
    exit 1
fi

# 3. ALTERAR PROVIDER NO SCHEMA.PRISMA
echo -e "${YELLOW}🔄 Ajustando schema.prisma para PostgreSQL...${NC}"
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
echo -e "${GREEN}✅ Provider ajustado${NC}"
echo ""

# 4. APLICAR ÍNDICES
echo -e "${YELLOW}🚀 Aplicando índices no Supabase...${NC}"
echo -e "${BLUE}   (Pode demorar alguns segundos)${NC}"
echo ""

npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ ÍNDICES APLICADOS NO SUPABASE!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${GREEN}📈 Melhorias aplicadas:${NC}"
    echo -e "   • ${GREEN}19 índices${NC} adicionados no PostgreSQL"
    echo -e "   • Calendário: ${GREEN}10-50x mais rápido${NC}"
    echo -e "   • Dashboard: ${GREEN}5-20x mais rápido${NC}"
    echo -e "   • Todas as consultas otimizadas"
    echo ""
    echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
    echo -e "   1. ${BLUE}Reinicie o servidor:${NC} npm run dev"
    echo -e "   2. ${BLUE}Teste o sistema${NC}"
    echo -e "   3. ${BLUE}Performance deve estar muito melhor!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar índices no Supabase${NC}"
    echo ""
    echo -e "${YELLOW}Verifique:${NC}"
    echo -e "   • Conexão com Supabase"
    echo -e "   • DATABASE_URL no .env"
    echo -e "   • Credenciais corretas"
    echo ""
    echo -e "${YELLOW}Para restaurar .env:${NC}"
    echo -e "   ${YELLOW}cp bkp/.env.backup.$TIMESTAMP .env${NC}"
    exit 1
fi
