# Script para corrigir imports do next-auth
$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Substituir import do getServerSession
    $newContent = $content -replace 'from "next-auth";', 'from "next-auth/next";'
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Corrigido: $($file.FullName)"
    }
}

Write-Host "Concluído!"
