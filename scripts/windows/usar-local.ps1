# Script para usar Banco LOCAL (SQLite) - Windows
# Sistema: Windows 10/11
# Data: 17/10/2025

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALTERNAR PARA BANCO DE DADOS LOCAL (SQLite)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Criar backup antes de qualquer alteração
Write-Host "📦 Criando backup do .env atual..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "bkp"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if (Test-Path ".env") {
    Copy-Item ".env" "$backupDir\.env.backup.$timestamp"
    Write-Host "✅ Backup salvo em: $backupDir\.env.backup.$timestamp" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# Backup do .env.supabase se estiver usando
if (Test-Path ".env.supabase") {
    Copy-Item ".env" "$backupDir\.env.supabase.bkp"
    Write-Host "✅ Configuração Supabase salva em: $backupDir\.env.supabase.bkp" -ForegroundColor Green
}

# Verificar se .env.local existe
if (Test-Path ".env.local") {
    Write-Host "📄 Usando configuração local existente..." -ForegroundColor Yellow
    Copy-Item ".env.local" ".env" -Force
    Write-Host "✅ Arquivo .env atualizado" -ForegroundColor Green
} else {
    # Criar .env com SQLite
    Write-Host "📝 Criando novo arquivo .env para SQLite..." -ForegroundColor Yellow
    
    $envContent = @'
# Configuração LOCAL (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: Resend (para envio de emails)
RESEND_API_KEY=""
'@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Atualizando Prisma Client..." -ForegroundColor Yellow

# Atualizar Prisma
try {
    npx prisma generate
    Write-Host "✅ Prisma Client atualizado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao atualizar Prisma Client" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ✅ CONFIGURAÇÃO LOCAL ATIVADA!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor White
Write-Host "   1. Execute: npm run dev" -ForegroundColor Yellow
Write-Host "   2. Acesse: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "💾 Backup do .env anterior em: $backupDir\" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
