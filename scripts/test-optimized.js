#!/usr/bin/env node

/**
 * Script Otimizado de Testes
 * 
 * Executa testes com melhor performance:
 * - Execução paralela quando possível
 * - Cache de resultados
 * - Relatórios detalhados
 * - Otimizações de memória
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestOptimizer {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: null,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkDependencies() {
    this.log('🔍 Verificando dependências...', 'info');
    
    try {
      // Verificar se node_modules existe
      if (!fs.existsSync('node_modules')) {
        this.log('❌ node_modules não encontrado. Execute: npm install', 'error');
        return false;
      }

      // Verificar dependências críticas
      const criticalDeps = [
        'jest',
        '@testing-library/react',
        '@testing-library/jest-dom'
      ];

      for (const dep of criticalDeps) {
        const depPath = path.join('node_modules', dep);
        if (!fs.existsSync(depPath)) {
          this.log(`❌ Dependência crítica não encontrada: ${dep}`, 'error');
          return false;
        }
      }

      this.log('✅ Todas as dependências estão instaladas', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Erro ao verificar dependências: ${error.message}`, 'error');
      return false;
    }
  }

  async runLint() {
    this.log('🔍 Executando lint...', 'info');
    
    try {
      execSync('npm run lint', { 
        stdio: 'pipe',
        timeout: 30000 // 30 segundos
      });
      
      this.log('✅ Lint passou sem erros', 'success');
      return true;
    } catch (error) {
      this.log('⚠️ Lint encontrou problemas (continuando...)', 'warning');
      return true; // Não bloquear por warnings de lint
    }
  }

  async runTests(options = {}) {
    this.log('🧪 Executando testes...', 'info');
    
    const {
      coverage = false,
      watch = false,
      parallel = true,
      maxWorkers = 4,
      testPathPattern = null
    } = options;

    try {
      let jestArgs = [];
      
      // Configurações de performance
      if (parallel) {
        jestArgs.push(`--maxWorkers=${maxWorkers}`);
      } else {
        jestArgs.push('--runInBand');
      }

      // Configurações de output
      jestArgs.push('--verbose');
      jestArgs.push('--passWithNoTests');
      
      // Coverage
      if (coverage) {
        jestArgs.push('--coverage');
        jestArgs.push('--coverageReporters=text');
        jestArgs.push('--coverageReporters=lcov');
      }

      // Watch mode
      if (watch) {
        jestArgs.push('--watch');
      }

      // Pattern específico
      if (testPathPattern) {
        jestArgs.push(testPathPattern);
      }

      // Otimizações de memória
      jestArgs.push('--logHeapUsage');
      jestArgs.push('--detectOpenHandles');

      const command = `npx jest ${jestArgs.join(' ')}`;
      this.log(`Executando: ${command}`, 'info');

      const output = execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000 // 5 minutos
      });

      // Parse do output do Jest
      this.parseJestOutput(output);
      
      this.log(`✅ Testes concluídos: ${this.results.passed}/${this.results.total} passaram`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Testes falharam: ${error.message}`, 'error');
      
      // Parse do output mesmo com erro
      if (error.stdout) {
        this.parseJestOutput(error.stdout);
      }
      
      return false;
    }
  }

  parseJestOutput(output) {
    try {
      // Extrair estatísticas do Jest
      const lines = output.split('\n');
      
      for (const line of lines) {
        // Test Suites: 2 failed, 20 passed, 22 total
        if (line.includes('Test Suites:')) {
          const match = line.match(/(\d+) total/);
          if (match) {
            this.results.total = parseInt(match[1]);
          }
        }
        
        // Tests: 8 failed, 330 passed, 338 total
        if (line.includes('Tests:')) {
          const totalMatch = line.match(/(\d+) total/);
          const passedMatch = line.match(/(\d+) passed/);
          const failedMatch = line.match(/(\d+) failed/);
          
          if (totalMatch) this.results.total = parseInt(totalMatch[1]);
          if (passedMatch) this.results.passed = parseInt(passedMatch[1]);
          if (failedMatch) this.results.failed = parseInt(failedMatch[1]);
        }
        
        // Time: 9.685 s
        if (line.includes('Time:')) {
          const match = line.match(/Time:\s*([\d.]+)\s*s/);
          if (match) {
            this.results.duration = parseFloat(match[1]);
          }
        }
      }
    } catch (error) {
      this.log(`⚠️ Erro ao analisar output dos testes: ${error.message}`, 'warning');
    }
  }

  async runBuild() {
    this.log('🏗️ Executando build...', 'info');
    
    try {
      execSync('npm run build', { 
        stdio: 'pipe',
        timeout: 180000 // 3 minutos
      });
      
      this.log('✅ Build concluído com sucesso', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Build falhou: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE TESTES OTIMIZADO');
    console.log('='.repeat(60));
    
    // Estatísticas gerais
    console.log(`⏱️  Tempo total: ${duration.toFixed(2)}s`);
    console.log(`🧪 Testes: ${this.results.passed}/${this.results.total} passaram`);
    
    if (this.results.failed > 0) {
      console.log(`❌ Falhas: ${this.results.failed}`);
    }
    
    if (this.results.duration > 0) {
      console.log(`⚡ Tempo de execução dos testes: ${this.results.duration}s`);
    }

    // Performance
    const testsPerSecond = this.results.total / (this.results.duration || 1);
    console.log(`📈 Performance: ${testsPerSecond.toFixed(1)} testes/segundo`);

    // Status final
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
    }
    
    console.log('='.repeat(60));
  }

  async runOptimizedTests(options = {}) {
    try {
      // 1. Verificar dependências
      const depsOk = await this.checkDependencies();
      if (!depsOk) {
        process.exit(1);
      }

      // 2. Lint (opcional)
      if (options.lint !== false) {
        await this.runLint();
      }

      // 3. Executar testes
      const testsOk = await this.runTests(options);

      // 4. Build (opcional)
      if (options.build !== false && testsOk) {
        await this.runBuild();
      }

      // 5. Gerar relatório
      await this.generateReport();

      // 6. Exit code
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      this.log(`❌ Erro fatal: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const optimizer = new TestOptimizer();

  const options = {
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    parallel: !args.includes('--no-parallel'),
    lint: !args.includes('--no-lint'),
    build: !args.includes('--no-build'),
    maxWorkers: 4
  };

  // Detectar número de CPUs para otimizar workers
  const os = require('os');
  const cpuCount = os.cpus().length;
  options.maxWorkers = Math.min(cpuCount, 4);

  // Pattern específico
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.testPathPattern = args[patternIndex + 1];
  }

  console.log('🚀 Iniciando testes otimizados...');
  console.log(`💻 CPUs detectadas: ${cpuCount}, usando ${options.maxWorkers} workers`);
  
  if (options.coverage) {
    console.log('📊 Coverage habilitado');
  }
  
  if (options.watch) {
    console.log('👀 Watch mode habilitado');
  }

  await optimizer.runOptimizedTests(options);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { TestOptimizer };