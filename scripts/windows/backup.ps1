# Script de Backup Completo - Finanças UP (Windows)
# Sistema: Windows 10/11
# Data: 17/10/2025

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BACKUP COMPLETO DE CONFIGURAÇÕES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Criar pasta de backup com timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "bkp\backup_$timestamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Write-Host "📁 Criando backup em: $backupDir" -ForegroundColor Yellow
Write-Host ""

# Contador de arquivos
$count = 0

# Função para copiar arquivo
function Backup-File {
    param($source, $destination, $label)
    
    if (Test-Path $source) {
        Copy-Item $source $destination
        Write-Host "✅ $label" -ForegroundColor Green
        return 1
    } else {
        Write-Host "⚠️  $label não encontrado" -ForegroundColor Yellow
        return 0
    }
}

# 1. Arquivo .env
$count += Backup-File ".env" "$backupDir\.env" ".env"

# 2. Arquivo .env.local (se existir)
$count += Backup-File ".env.local" "$backupDir\.env.local" ".env.local"

# 3. Arquivo .env.supabase (se existir)
$count += Backup-File ".env.supabase" "$backupDir\.env.supabase" ".env.supabase"

# 4. Prisma schema
$count += Backup-File "prisma\schema.prisma" "$backupDir\schema.prisma" "prisma\schema.prisma"

# 5. Next config
$count += Backup-File "next.config.mjs" "$backupDir\next.config.mjs" "next.config.mjs"

# 6. Package.json
$count += Backup-File "package.json" "$backupDir\package.json" "package.json"

# 7. tsconfig.json
$count += Backup-File "tsconfig.json" "$backupDir\tsconfig.json" "tsconfig.json"

# 8. tailwind.config.ts
$count += Backup-File "tailwind.config.ts" "$backupDir\tailwind.config.ts" "tailwind.config.ts"

# 9. Banco de dados local (se existir)
$count += Backup-File "prisma\dev.db" "$backupDir\dev.db" "prisma\dev.db"

# Finalização
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ BACKUP COMPLETO REALIZADO!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Estatísticas:" -ForegroundColor White
Write-Host "   • Arquivos salvos: $count" -ForegroundColor Yellow
Write-Host "   • Localização: $backupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Para restaurar um arquivo:" -ForegroundColor White
Write-Host "   Copy-Item $backupDir\[arquivo] ." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para listar backups:" -ForegroundColor White
Write-Host "   Get-ChildItem bkp\" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
