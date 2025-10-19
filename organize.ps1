# Script de Organização do Projeto
$arquivosParaMover = @(
    'BUILD-INFO.md',
    'CHANGELOG-OTIMIZACOES.md',
    'COMANDOS-RAPIDOS.md',
    'CONFIGURAR-VERCEL.md',
    'CORRECAO-BUILD-VERCEL.md',
    'CORRIGIR-ERRO-JSON-VERCEL.md',
    'GUIA-IMPLEMENTACAO-OTIMIZACOES.md',
    'GUIA-INSTALACAO-MELHORIAS.md',
    'IMPLEMENTACAO-100-PORCENTO.md',
    'MELHORIAS-IMPLEMENTADAS-FINAL.md',
    'MELHORIAS-IMPLEMENTADAS.md',
    'MELHORIAS-RECOMENDADAS.md',
    'OTIMIZACOES-PERFORMANCE.md',
    'PROBLEMA-LOGIN-VERCEL.md',
    'RELATORIO-FINAL-OTIMIZACOES.md',
    'RESUMO-OTIMIZACOES.md',
    'SOLUCAO-FINAL-LOGIN.md',
    'AUDITORIA-COMPLETA.md'
)

Write-Host "Movendo arquivos MD para docs/archive..." -ForegroundColor Cyan

foreach ($arquivo in $arquivosParaMover) {
    if (Test-Path $arquivo) {
        Move-Item $arquivo docs\archive\ -Force
        Write-Host "✓ Movido: $arquivo" -ForegroundColor Green
    }
}

Write-Host "`nOrganização concluída!" -ForegroundColor Green
