# Script de Instalação para Windows - Finanças UP
# Versão: 1.0.0
# Data: 19/10/2025

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "Script de Instalação - Finanças UP" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\install.ps1 [-Force] [-Help]"
    Write-Host ""
    Write-Host "Parâmetros:"
    Write-Host "  -Force : Força a reinstalação mesmo se já estiver instalado"
    Write-Host "  -Help  : Mostra esta mensagem de ajuda"
    Write-Host ""
    Write-Host "Pré-requisitos:"
    Write-Host "  - Windows 10/11"
    Write-Host "  - PowerShell 5.1 ou superior"
    Write-Host "  - Permissões de administrador"
    Write-Host ""
    Write-Host "O que será instalado:"
    Write-Host "  - Node.js 18+ (LTS)"
    Write-Host "  - Git"
    Write-Host "  - PostgreSQL 15+"
    Write-Host ""
    exit
}

# Verificar se está executando como administrador
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Este script precisa ser executado como administrador!" -ForegroundColor Red
    Write-Host "Clique com o botão direito no PowerShell e selecione 'Executar como administrador'"
    exit 1
}

Write-Host "🚀 Iniciando instalação das dependências para Finanças UP..." -ForegroundColor Green

# Função para instalar via Winget
function Install-WithWinget {
    param([string]$PackageId, [string]$DisplayName)

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "📦 Instalando $DisplayName via Winget..." -ForegroundColor Yellow
        winget install --id=$PackageId -e --silent
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $DisplayName instalado com sucesso!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Falha ao instalar $DisplayName via Winget" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

# Função para instalar via Chocolatey (fallback)
function Install-WithChocolatey {
    param([string]$PackageName, [string]$DisplayName)

    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "🍫 Instalando $DisplayName via Chocolatey..." -ForegroundColor Yellow
        choco install $PackageName -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $DisplayName instalado com sucesso!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Falha ao instalar $DisplayName via Chocolatey" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

# Instalar Winget se não estiver disponível
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Winget não encontrado. Tentando instalar..." -ForegroundColor Yellow
    # Nota: Winget vem pré-instalado no Windows 10/11 recente
    Write-Host "⚠️  Winget deve estar disponível no Windows 10/11. Se não estiver, atualize seu sistema." -ForegroundColor Red
}

# Instalar Chocolatey se necessário
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Chocolatey não encontrado. Instalando..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Instalar Node.js
Write-Host "🔧 Verificando Node.js..." -ForegroundColor Cyan
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if ((-not $nodeInstalled) -or $Force) {
    if (-not (Install-WithWinget "OpenJS.NodeJS.LTS" "Node.js")) {
        if (-not (Install-WithChocolatey "nodejs" "Node.js")) {
            Write-Host "❌ Falha ao instalar Node.js. Instale manualmente de https://nodejs.org/" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Node.js já está instalado" -ForegroundColor Green
}

# Instalar Git
Write-Host "🔧 Verificando Git..." -ForegroundColor Cyan
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ((-not $gitInstalled) -or $Force) {
    if (-not (Install-WithWinget "Git.Git" "Git")) {
        if (-not (Install-WithChocolatey "git" "Git")) {
            Write-Host "❌ Falha ao instalar Git. Instale manualmente de https://git-scm.com/" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Git já está instalado" -ForegroundColor Green
}

# Instalar PostgreSQL
Write-Host "🔧 Verificando PostgreSQL..." -ForegroundColor Cyan
$postgresInstalled = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ((-not $postgresInstalled) -or $Force) {
    if (-not (Install-WithWinget "PostgreSQL.PostgreSQL" "PostgreSQL")) {
        if (-not (Install-WithChocolatey "postgresql" "PostgreSQL")) {
            Write-Host "❌ Falha ao instalar PostgreSQL. Instale manualmente de https://www.postgresql.org/" -ForegroundColor Red
            Write-Host "   Ou use uma conta Supabase conforme a documentação." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ PostgreSQL já está instalado" -ForegroundColor Green
}

# Verificar versões instaladas
Write-Host ""
Write-Host "🔍 Verificando versões instaladas..." -ForegroundColor Cyan

try {
    $nodeVersion = & node --version 2>$null
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js: ❌ Não encontrado" -ForegroundColor Red
}

try {
    $npmVersion = & npm --version 2>$null
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm: ❌ Não encontrado" -ForegroundColor Red
}

try {
    $gitVersion = & git --version 2>$null
    Write-Host "Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git: ❌ Não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Instalação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Clone o repositório: git clone https://github.com/alphasinfo/financas-up.git"
Write-Host "2. Entre na pasta: cd financas-up"
Write-Host "3. Configure o ambiente: npm install"
Write-Host "4. Configure o banco: npx prisma generate && npx prisma db push"
Write-Host "5. Execute: npm run dev"
Write-Host ""
Write-Host "Para mais detalhes, consulte a documentação em docs/01-INICIO-RAPIDO.md"
