#!/usr/bin/env node

/**
 * Pre-commit Hook
 * Executa build e testes antes de permitir commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  log('🔍 Pre-commit Hook - Verificando código...', 'cyan');

  try {
    // 1. Executar testes
    section('🧪 Executando Testes');
    log('Rodando npm test...', 'cyan');
    execSync('npm test', { stdio: 'inherit' });
    log('✅ Todos os testes passaram!', 'green');

    // 2. Executar build
    section('🏗️  Executando Build');
    log('Rodando npm run build...', 'cyan');
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build concluído com sucesso!', 'green');

    // 3. Verificar se há erros de lint
    section('🔍 Verificando Lint');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      log('✅ Nenhum erro de lint encontrado!', 'green');
    } catch (error) {
      log('⚠️  Avisos de lint encontrados (não bloqueante)', 'yellow');
    }

    // 4. Verificar tipos TypeScript
    section('🔷 Verificando Tipos');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      log('✅ Nenhum erro de tipo encontrado!', 'green');
    } catch (error) {
      log('❌ Erros de tipo encontrados!', 'red');
      process.exit(1);
    }

    // 5. Resumo final
    section('✅ Pre-commit Check Completo');
    log('Todas as verificações passaram!', 'green');
    log('Commit pode prosseguir.', 'green');

    process.exit(0);
  } catch (error) {
    log('\n❌ Pre-commit check falhou!', 'red');
    log('Por favor, corrija os erros antes de fazer commit.', 'yellow');
    process.exit(1);
  }
}

main();
