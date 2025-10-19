#!/bin/bash

# Script de Instalação para Linux Manjaro - Finanças UP
# Versão: 1.0.0
# Data: 19/10/2025

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se é Manjaro
if ! grep -q "Manjaro" /etc/os-release; then
    error "Este script é específico para Manjaro Linux. Para outras distribuições, use o script apropriado."
fi

# Verificar se é root ou tem sudo
if [[ $EUID -eq 0 ]]; then
    error "Não execute este script como root. Use um usuário com privilégios sudo."
fi

if ! command -v sudo &> /dev/null; then
    error "sudo não está instalado ou configurado."
fi

log "🚀 Iniciando instalação das dependências para Finanças UP em Manjaro..."

# Atualizar sistema
log "📦 Atualizando repositórios e sistema..."
sudo pacman -Syu --noconfirm || error "Falha ao atualizar o sistema"

# Instalar yay se não estiver presente
if ! command -v yay &> /dev/null; then
    log "📦 Instalando yay (AUR helper)..."
    sudo pacman -S --needed --noconfirm base-devel git
    git clone https://aur.archlinux.org/yay.git /tmp/yay
    cd /tmp/yay
    makepkg -si --noconfirm
    cd -
    rm -rf /tmp/yay
    success "yay instalado com sucesso"
else
    success "yay já está instalado"
fi

# Instalar Node.js e npm
log "🔧 Verificando Node.js..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    log "📦 Instalando Node.js e npm via yay..."
    yay -S --noconfirm nodejs npm || error "Falha ao instalar Node.js"
    success "Node.js e npm instalados"
else
    success "Node.js e npm já estão instalados"
fi

# Instalar Git
log "🔧 Verificando Git..."
if ! command -v git &> /dev/null; then
    log "📦 Instalando Git..."
    sudo pacman -S --noconfirm git || error "Falha ao instalar Git"
    success "Git instalado"
else
    success "Git já está instalado"
fi

# Instalar PostgreSQL
log "🔧 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log "📦 Instalando PostgreSQL..."
    yay -S --noconfirm postgresql postgresql-libs || error "Falha ao instalar PostgreSQL"
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    success "PostgreSQL instalado e iniciado"
else
    success "PostgreSQL já está instalado"
fi

# Verificar versões
log "🔍 Verificando versões instaladas..."
echo ""

if command -v node &> /dev/null; then
    echo -e "Node.js: $(node --version)"
else
    error "Node.js não encontrado após instalação"
fi

if command -v npm &> /dev/null; then
    echo -e "npm: $(npm --version)"
else
    error "npm não encontrado após instalação"
fi

if command -v git &> /dev/null; then
    echo -e "Git: $(git --version)"
else
    error "Git não encontrado após instalação"
fi

if command -v psql &> /dev/null; then
    echo -e "PostgreSQL: $(psql --version)"
else
    error "PostgreSQL não encontrado após instalação"
fi

# Configurar PostgreSQL (usuário padrão)
log "🔧 Configurando PostgreSQL..."
sudo -u postgres createuser --interactive --pwprompt $(whoami) || warning "Usuário PostgreSQL pode já existir"
sudo -u postgres createdb $(whoami) || warning "Banco de dados pode já existir"

success "Instalação concluída!"

log "📋 Próximos passos:"
echo "1. Clone o repositório:"
echo "   git clone https://github.com/alphasinfo/financas-up.git"
echo "   cd financas-up"
echo ""
echo "2. Configure o ambiente:"
echo "   npm install"
echo ""
echo "3. Configure o banco:"
echo "   npx prisma generate"
echo "   npx prisma db push"
echo ""
echo "4. Execute o projeto:"
echo "   npm run dev"
echo ""
echo "📖 Consulte a documentação em docs/01-INICIO-RAPIDO.md para mais detalhes"

# Finalizar
success "🎉 Ambiente Manjaro configurado para Finanças UP!"
