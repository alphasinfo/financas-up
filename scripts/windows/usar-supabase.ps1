# Script para usar Banco SUPABASE (PostgreSQL) - Windows
# Sistema: Windows 10/11
# Data: 17/10/2025

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALTERNAR PARA BANCO SUPABASE (PostgreSQL)" -ForegroundColor Cyan
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

# Backup do .env.local se estiver usando
if (Test-Path ".env.local") {
    Copy-Item ".env" "$backupDir\.env.local.bkp"
    Write-Host "✅ Configuração local salva em: $backupDir\.env.local.bkp" -ForegroundColor Green
}

# Verificar se .env.supabase existe
if (Test-Path ".env.supabase") {
    Write-Host "📄 Usando configuração Supabase existente..." -ForegroundColor Yellow
    Copy-Item ".env.supabase" ".env" -Force
    Write-Host "✅ Arquivo .env atualizado" -ForegroundColor Green
} else {
    # Criar .env template para Supabase
    Write-Host "📝 Criando template de .env para Supabase..." -ForegroundColor Yellow
    
    $envContent = @'
# Configuração SUPABASE (PostgreSQL)
# ATENÇÃO: Substitua pela sua URL do Supabase
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="https://seu-dominio.vercel.app"

# Opcional: Resend (para envio de emails)
RESEND_API_KEY=""
'@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    $envContent | Out-File -FilePath ".env.supabase" -Encoding UTF8
    
    Write-Host "✅ Template criado em .env e .env.supabase" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ATENÇÃO: Você precisa editar o .env e adicionar:" -ForegroundColor Yellow
    Write-Host "   - URL do banco Supabase" -ForegroundColor Yellow
    Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Yellow
    Write-Host "   - NEXTAUTH_URL (URL do seu deploy)" -ForegroundColor Yellow
    Write-Host ""
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
Write-Host "  ✅ CONFIGURAÇÃO SUPABASE ATIVADA!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor White
Write-Host "   1. Verifique as credenciais no .env" -ForegroundColor Yellow
Write-Host "   2. Execute: npx prisma db push" -ForegroundColor Yellow
Write-Host "   3. Execute: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "💾 Backup do .env anterior em: $backupDir\" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
