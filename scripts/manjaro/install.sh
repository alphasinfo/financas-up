#!/bin/bash

# Script de Instalação - Finanças UP
# Sistema: Manjaro Linux (Arch-based)
# Data: 16/10/2025

echo "================================================"
echo "  Instalação Finanças UP - Manjaro Linux"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Não execute este script como root${NC}"
   exit 1
fi

# 1. Atualizar sistema
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
sudo pacman -Syu --noconfirm

# 2. Instalar Node.js e npm
echo -e "${YELLOW}📦 Instalando Node.js e npm...${NC}"
if ! command -v node &> /dev/null; then
    sudo pacman -S nodejs npm --noconfirm
else
    echo -e "${GREEN}✅ Node.js já instalado: $(node -v)${NC}"
fi

# 3. Instalar Git
echo -e "${YELLOW}📦 Instalando Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo pacman -S git --noconfirm
else
    echo -e "${GREEN}✅ Git já instalado: $(git --version)${NC}"
fi

# 4. Instalar dependências do projeto
echo -e "${YELLOW}📦 Instalando dependências do projeto...${NC}"
npm install

# 5. Configurar banco de dados
echo -e "${YELLOW}🗄️  Configurando banco de dados...${NC}"
echo ""

# 💾 BACKUP DE .ENV (se existir)
if [ -f .env ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p bkp
    cp .env "bkp/.env.backup.$TIMESTAMP"
    echo -e "${GREEN}✅ Backup do .env salvo em: bkp/.env.backup.$TIMESTAMP${NC}"
    echo ""
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando...${NC}"
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=\"file:./dev.db\"" > .env
fi

# Aplicar migrations
echo -e "${YELLOW}🔄 Aplicando migrations do banco...${NC}"
npx prisma db push

# Gerar Prisma Client
echo -e "${YELLOW}🔄 Gerando Prisma Client...${NC}"
npx prisma generate

# 6. Seed do banco (opcional)
echo ""
read -p "Deseja popular o banco com dados de teste? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}🌱 Populando banco de dados...${NC}"
    npm run seed
fi

# 7. Finalização
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ Instalação concluída com sucesso!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Para iniciar o servidor de desenvolvimento:"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""
echo -e "O sistema estará disponível em:"
echo -e "${YELLOW}  http://localhost:3000${NC}"
echo ""
echo -e "Credenciais padrão (se usou seed):"
echo -e "  Email: ${YELLOW}admin@financas.com${NC}"
echo -e "  Senha: ${YELLOW}123456${NC}"
echo ""
