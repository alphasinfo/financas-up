#!/usr/bin/env node

/**
 * Script de Teste Detalhado
 * Executa testes com cobertura e gera relatórios detalhados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando Testes Detalhados...\n');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// 1. Executar testes com cobertura
section('📊 Executando Testes com Cobertura');

try {
  log('Executando Jest com coverage...', 'cyan');
  execSync('npx jest --coverage --verbose', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  log('✅ Testes executados com sucesso!', 'green');
} catch (error) {
  log('❌ Alguns testes falharam!', 'red');
  process.exit(1);
}

// 2. Analisar cobertura
section('📈 Análise de Cobertura');

const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

if (fs.existsSync(coveragePath)) {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const total = coverage.total;

  log('Cobertura Total:', 'bright');
  console.log(`  Statements: ${total.statements.pct}%`);
  console.log(`  Branches:   ${total.branches.pct}%`);
  console.log(`  Functions:  ${total.functions.pct}%`);
  console.log(`  Lines:      ${total.lines.pct}%`);

  // Verificar se atingiu meta de 80%
  const minCoverage = 80;
  const avgCoverage = (
    total.statements.pct +
    total.branches.pct +
    total.functions.pct +
    total.lines.pct
  ) / 4;

  console.log(`\n  Média: ${avgCoverage.toFixed(2)}%`);

  if (avgCoverage >= minCoverage) {
    log(`✅ Meta de cobertura atingida (>= ${minCoverage}%)`, 'green');
  } else {
    log(`⚠️  Meta de cobertura não atingida (< ${minCoverage}%)`, 'yellow');
  }

  // Arquivos com baixa cobertura
  console.log('\n📉 Arquivos com cobertura < 80%:');
  let lowCoverageFiles = [];

  for (const [file, data] of Object.entries(coverage)) {
    if (file === 'total') continue;

    const fileCoverage = (
      data.statements.pct +
      data.branches.pct +
      data.functions.pct +
      data.lines.pct
    ) / 4;

    if (fileCoverage < 80) {
      lowCoverageFiles.push({
        file: file.replace(process.cwd(), ''),
        coverage: fileCoverage.toFixed(2),
      });
    }
  }

  if (lowCoverageFiles.length > 0) {
    lowCoverageFiles
      .sort((a, b) => a.coverage - b.coverage)
      .forEach((item) => {
        console.log(`  ${item.file}: ${item.coverage}%`);
      });
  } else {
    log('  Todos os arquivos têm cobertura >= 80%! 🎉', 'green');
  }
} else {
  log('⚠️  Arquivo de cobertura não encontrado', 'yellow');
}

// 3. Estatísticas de testes
section('📊 Estatísticas de Testes');

try {
  const testResults = execSync('npx jest --json --silent', {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  const results = JSON.parse(testResults);

  log('Resumo dos Testes:', 'bright');
  console.log(`  Total de Suites: ${results.numTotalTestSuites}`);
  console.log(`  Suites Passaram: ${results.numPassedTestSuites}`);
  console.log(`  Suites Falharam: ${results.numFailedTestSuites}`);
  console.log(`  Total de Testes: ${results.numTotalTests}`);
  console.log(`  Testes Passaram: ${results.numPassedTests}`);
  console.log(`  Testes Falharam: ${results.numFailedTests}`);
  console.log(`  Tempo Total: ${(results.testResults.reduce((acc, r) => acc + r.perfStats.runtime, 0) / 1000).toFixed(2)}s`);

  // Taxa de sucesso
  const successRate = (results.numPassedTests / results.numTotalTests) * 100;
  console.log(`\n  Taxa de Sucesso: ${successRate.toFixed(2)}%`);

  if (successRate === 100) {
    log('✅ Todos os testes passaram! 🎉', 'green');
  } else {
    log(`⚠️  ${results.numFailedTests} teste(s) falharam`, 'yellow');
  }

  // Testes mais lentos
  console.log('\n⏱️  Testes mais lentos (top 5):');
  const slowTests = results.testResults
    .flatMap((suite) =>
      suite.testResults.map((test) => ({
        name: `${suite.name.split('/').pop()} > ${test.fullName}`,
        duration: test.duration,
      }))
    )
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  slowTests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name}: ${test.duration}ms`);
  });
} catch (error) {
  log('⚠️  Não foi possível obter estatísticas detalhadas', 'yellow');
}

// 4. Verificar qualidade do código
section('🔍 Análise de Qualidade');

try {
  log('Executando ESLint...', 'cyan');
  execSync('npx eslint src --ext .ts,.tsx --max-warnings 0', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  log('✅ Nenhum problema de linting encontrado!', 'green');
} catch (error) {
  log('⚠️  Problemas de linting encontrados', 'yellow');
}

// 5. Verificar tipos TypeScript
section('🔷 Verificação de Tipos');

try {
  log('Executando TypeScript type check...', 'cyan');
  execSync('npx tsc --noEmit', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  log('✅ Nenhum erro de tipo encontrado!', 'green');
} catch (error) {
  log('⚠️  Erros de tipo encontrados', 'yellow');
}

// 6. Resumo final
section('📝 Resumo Final');

const reportPath = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html');
if (fs.existsSync(reportPath)) {
  log(`📄 Relatório HTML de cobertura disponível em:`, 'cyan');
  console.log(`   ${reportPath}\n`);
}

log('✨ Análise completa!', 'bright');
log('Para ver o relatório de cobertura, execute:', 'cyan');
console.log('   npm run test:coverage:open\n');

// Gerar arquivo de resumo
const summaryPath = path.join(process.cwd(), 'test-summary.json');
const summary = {
  timestamp: new Date().toISOString(),
  coverage: fs.existsSync(coveragePath)
    ? JSON.parse(fs.readFileSync(coveragePath, 'utf8')).total
    : null,
  success: true,
};

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
log(`💾 Resumo salvo em: ${summaryPath}`, 'green');
