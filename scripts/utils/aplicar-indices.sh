#!/bin/bash

# Script para aplicar índices de performance no banco de dados
# Data: 17/10/2025

echo "================================================"
echo "  APLICAR ÍNDICES DE PERFORMANCE"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Fazendo backup do banco antes de aplicar índices...${NC}"

# Backup do banco
if [ -f "prisma/dev.db" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p bkp
    cp prisma/dev.db "bkp/dev.db.antes-indices.$TIMESTAMP"
    echo -e "${GREEN}✅ Backup salvo em: bkp/dev.db.antes-indices.$TIMESTAMP${NC}"
else
    echo -e "${YELLOW}⚠️  Banco local não encontrado (pode estar usando Supabase)${NC}"
fi

echo ""
echo -e "${YELLOW}🔄 Aplicando migration para adicionar índices...${NC}"
echo ""

# Aplicar migration
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Índices aplicados com sucesso!${NC}"
    echo ""
    echo -e "${GREEN}📈 Melhorias de performance aplicadas:${NC}"
    echo -e "   • Índices em Transacao (usuarioId, dataCompetencia, status)"
    echo -e "   • Índices em Fatura (cartaoId, mesRef/anoRef, status, dataVenc)"
    echo -e "   • Índices em Emprestimo (usuarioId, status)"
    echo -e "   • Índices em ParcelaEmprestimo (emprestimoId, status, dataVenc)"
    echo -e "   • Índices em Orcamento (usuarioId, mesRef/anoRef)"
    echo ""
    echo -e "${YELLOW}🚀 Benefícios esperados:${NC}"
    echo -e "   • Calendário: ${GREEN}10-50x mais rápido${NC}"
    echo -e "   • Dashboard: ${GREEN}5-20x mais rápido${NC}"
    echo -e "   • Listagens: ${GREEN}3-10x mais rápido${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar índices${NC}"
    echo ""
    echo -e "${YELLOW}Para restaurar backup:${NC}"
    echo -e "   ${YELLOW}cp bkp/dev.db.antes-indices.$TIMESTAMP prisma/dev.db${NC}"
    exit 1
fi
