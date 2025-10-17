# Script de Instalação - Finanças UP
# Sistema: Windows 10/11
# Data: 16/10/2025

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Instalação Finanças UP - Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  AVISO: Execute este script como Administrador para melhor experiência" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js já instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js 20.x ou superior:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Após instalar, execute este script novamente." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 2. Verificar npm
Write-Host "📦 Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✅ npm já instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# 3. Verificar Git
Write-Host "📦 Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git já instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git não encontrado. Recomendado para versionamento." -ForegroundColor Yellow
    Write-Host "  Download: https://git-scm.com/download/win" -ForegroundColor Cyan
}

# 4. Instalar dependências do projeto
Write-Host ""
Write-Host "📦 Instalando dependências do projeto..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 5. Configurar banco de dados
Write-Host ""
Write-Host "🗄️  Configurando banco de dados..." -ForegroundColor Yellow
Write-Host ""

# 💾 BACKUP DE .ENV (se existir)
if (Test-Path .env) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    if (-not (Test-Path "bkp")) {
        New-Item -ItemType Directory -Path "bkp" | Out-Null
    }
    Copy-Item .env "bkp\.env.backup.$timestamp"
    Write-Host "✅ Backup do .env salvo em: bkp\.env.backup.$timestamp" -ForegroundColor Green
    Write-Host ""
}

# Verificar se arquivo .env existe
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Arquivo .env não encontrado. Criando..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
    } else {
        'DATABASE_URL="file:./dev.db"' | Out-File -FilePath .env -Encoding UTF8
    }
}

# Aplicar migrations
Write-Host "🔄 Aplicando migrations do banco..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar migrations!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Gerar Prisma Client
Write-Host "🔄 Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 6. Seed do banco (opcional)
Write-Host ""
$seed = Read-Host "Deseja popular o banco com dados de teste? (s/N)"
if ($seed -eq "s" -or $seed -eq "S") {
    Write-Host "🌱 Populando banco de dados..." -ForegroundColor Yellow
    npm run seed
}

# 7. Finalização
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor de desenvolvimento:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "O sistema estará disponível em:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciais padrão (se usou seed):" -ForegroundColor White
Write-Host "  Email: admin@financas.com" -ForegroundColor Yellow
Write-Host "  Senha: 123456" -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter para sair"
