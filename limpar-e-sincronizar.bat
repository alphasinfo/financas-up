@echo off
echo Limpando arquivos desnecessarios...

REM Remover arquivos MD (exceto README.md)
del /F /Q "COMO-APLICAR-INDICES-SUPABASE.md" 2>nul
del /F /Q "CORRECOES-TYPESCRIPT.md" 2>nul
del /F /Q "CORRIGIR-URL-SUPABASE.md" 2>nul
del /F /Q "EXECUTAR-SQL-AGORA.md" 2>nul
del /F /Q "GUIA-COMPLETO-SETUP.md" 2>nul
del /F /Q "NOVO-PROJETO-SUPABASE.md" 2>nul
del /F /Q "OTIMIZACOES-APLICADAS.md" 2>nul
del /F /Q "RESET-MANUAL-SUPABASE.md" 2>nul
del /F /Q "RESET-SUPABASE.md" 2>nul
del /F /Q "RESTAURAR-SUPABASE.md" 2>nul
del /F /Q "RESUMO-CORRECOES-FINAIS.md" 2>nul
del /F /Q "RESUMO-NOVO-PROJETO.md" 2>nul
del /F /Q "SETUP-LOCAL.md" 2>nul
del /F /Q "SETUP-NOVO-PROJETO.md" 2>nul
del /F /Q "SINCRONIZAR-SUPABASE.md" 2>nul
del /F /Q "SOLUCAO-DEFINITIVA.md" 2>nul
del /F /Q "ARQUIVOS-PARA-REMOVER.txt" 2>nul

REM Remover SQL (exceto SQL-PROJETO-NOVO.sql)
del /F /Q "CORRIGIR-TABELAS-EXISTENTES.sql" 2>nul
del /F /Q "RESET-COMPLETO-SUPABASE.sql" 2>nul
del /F /Q "SQL-COMPLETO-FINAL.sql" 2>nul

REM Remover scripts temporários
del /F /Q "EXECUTAR-AGORA.sh" 2>nul
del /F /Q "atualizar-config-supabase.js" 2>nul
del /F /Q "corrigir-env-supabase.js" 2>nul
del /F /Q "diagnostico-completo.js" 2>nul
del /F /Q "fix-all-session-types.js" 2>nul
del /F /Q "fix-all-session-undefined.js" 2>nul
del /F /Q "fix-all-typescript-errors.js" 2>nul
del /F /Q "fix-dashboard-pages.js" 2>nul
del /F /Q "fix-double-const.js" 2>nul
del /F /Q "fix-final-session-issues.js" 2>nul
del /F /Q "fix-imports.js" 2>nul
del /F /Q "fix-nextauth-imports.ps1" 2>nul
del /F /Q "fix-session-user-undefined.js" 2>nul
del /F /Q "limpar-supabase.js" 2>nul
del /F /Q "reset-supabase-completo.js" 2>nul
del /F /Q "reset-supabase-manual.js" 2>nul
del /F /Q "setup-dev-completo.js" 2>nul
del /F /Q "setup-local-dev.js" 2>nul
del /F /Q "sincronizar-forcado-supabase.js" 2>nul
del /F /Q "sync-supabase-schema.js" 2>nul
del /F /Q "testar-conexao-supabase.js" 2>nul
del /F /Q "verificar-schema-supabase.js" 2>nul
del /F /Q "verify-project.js" 2>nul
del /F /Q "tsconfig.tsbuildinfo" 2>nul

REM Limpar pasta bkp
cd bkp
for %%F in (*) do (
    if not "%%F"==".env.supabase.bkp" if not "%%F"==".env.local.bkp" del /F /Q "%%F" 2>nul
)
cd ..

REM Remover pastas vazias
rmdir /S /Q "scripts\debian" 2>nul
rmdir /S /Q "scripts\manjaro" 2>nul
rmdir /S /Q "scripts\windows" 2>nul
rmdir /S /Q "docs\temp-otimizacoes" 2>nul

echo.
echo Limpeza concluida!
echo.
echo Sincronizando com GitHub...
echo.

REM Git add, commit e push
git add .
git commit -m "chore: limpeza de arquivos temporarios e desnecessarios"
git push origin main

echo.
echo Sincronizacao concluida!
echo.
pause
