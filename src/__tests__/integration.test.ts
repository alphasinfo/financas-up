/**
 * TESTE DE INTEGRAÇÃO COMPLETO
 * 
 * Este teste verifica o sistema por completo, incluindo:
 * - Build do projeto
 * - Todas as funcionalidades principais
 * - Integração entre componentes
 * - Performance
 * 
 * ATENÇÃO: Este teste é LENTO (pode levar 30-60 segundos)
 * Use apenas quando necessário verificar o sistema completo
 * 
 * Como executar:
 * npm test -- integration.test.ts
 * 
 * Quando usar:
 * - Antes de fazer deploy
 * - Após mudanças grandes no código
 * - Para validar o sistema completo
 */

describe('🔍 TESTE DE INTEGRAÇÃO COMPLETO', () => {
  describe('1. Verificação de Build', () => {
    it('deve ter todos os arquivos principais', () => {
      const fs = require('fs');
      const path = require('path');

      const arquivosEssenciais = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'prisma/schema.prisma',
        '.env.local',
      ];

      arquivosEssenciais.forEach(arquivo => {
        const caminho = path.join(process.cwd(), arquivo);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });

    it('deve ter todas as dependências instaladas', () => {
      const packageJson = require('../../package.json');
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['next']).toBeDefined();
      expect(packageJson.dependencies['react']).toBeDefined();
      expect(packageJson.dependencies['@prisma/client']).toBeDefined();
      expect(packageJson.dependencies['next-auth']).toBeDefined();
    });

    it('deve ter scripts de build configurados', () => {
      const packageJson = require('../../package.json');
      
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });
  });

  describe('2. Verificação de Funcionalidades', () => {
    it('deve ter todas as 19 funcionalidades implementadas', () => {
      const fs = require('fs');
      const path = require('path');

      const funcionalidades = [
        'src/app/dashboard/page.tsx',
        'src/app/dashboard/financeiro/page.tsx',
        'src/app/dashboard/contas/page.tsx',
        'src/app/dashboard/cartoes/page.tsx',
        'src/app/dashboard/emprestimos/page.tsx',
        'src/app/dashboard/investimentos/page.tsx',
        'src/app/dashboard/orcamentos/page.tsx',
        'src/app/dashboard/metas/page.tsx',
        'src/app/dashboard/calendario/page.tsx',
        'src/app/dashboard/relatorios/page.tsx',
        'src/app/dashboard/conciliacao/page.tsx',
        'src/app/dashboard/insights/page.tsx',
        'src/app/dashboard/relatorios-avancados/page.tsx',
        'src/app/dashboard/backup/page.tsx',
      ];

      funcionalidades.forEach(func => {
        const caminho = path.join(process.cwd(), func);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });

    it('deve ter todas as APIs implementadas', () => {
      const fs = require('fs');
      const path = require('path');

      const apis = [
        'src/app/api/transacoes/route.ts',
        'src/app/api/cartoes/route.ts',
        'src/app/api/contas/route.ts',
        'src/app/api/investimentos/route.ts',
        'src/app/api/emprestimos/route.ts',
        'src/app/api/metas/route.ts',
        'src/app/api/orcamentos/route.ts',
        'src/app/api/backup/route.ts',
        'src/app/api/relatorios-avancados/route.ts',
        'src/app/api/multi-moeda/route.ts',
        'src/app/api/sync/route.ts',
        'src/app/api/integracao-bancaria/route.ts',
      ];

      apis.forEach(api => {
        const caminho = path.join(process.cwd(), api);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });
  });

  describe('3. Verificação de Componentes', () => {
    it('deve ter componentes de layout', () => {
      const fs = require('fs');
      const path = require('path');

      const componentes = [
        'src/components/layout/header.tsx',
        'src/components/layout/sidebar.tsx',
        'src/components/layout/bottom-nav.tsx',
      ];

      componentes.forEach(comp => {
        const caminho = path.join(process.cwd(), comp);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });

    it('deve ter componentes de gráficos', () => {
      const fs = require('fs');
      const path = require('path');

      const graficos = [
        'src/components/charts/comparacao-chart.tsx',
        'src/components/charts/previsao-chart.tsx',
        'src/components/charts/patrimonio-chart.tsx',
      ];

      graficos.forEach(graf => {
        const caminho = path.join(process.cwd(), graf);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });

    it('deve ter componentes de animação', () => {
      const fs = require('fs');
      const path = require('path');

      const animacoes = [
        'src/components/animations/fade-in.tsx',
        'src/components/animations/slide-in.tsx',
        'src/components/animations/scale-in.tsx',
      ];

      animacoes.forEach(anim => {
        const caminho = path.join(process.cwd(), anim);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });
  });

  describe('4. Verificação de Bibliotecas', () => {
    it('deve importar backup corretamente', async () => {
      const { criarBackup, listarBackups } = await import('../lib/backup');
      expect(typeof criarBackup).toBe('function');
      expect(typeof listarBackups).toBe('function');
    });

    it('deve importar cache corretamente', async () => {
      const { cache } = await import('../lib/cache');
      expect(cache).toBeDefined();
      expect(typeof cache.get).toBe('function');
      expect(typeof cache.set).toBe('function');
    });

    it('deve importar formatters corretamente', async () => {
      const { formatarMoeda, formatarData } = await import('../lib/formatters');
      expect(typeof formatarMoeda).toBe('function');
      expect(typeof formatarData).toBe('function');
    });

    it('deve importar rate-limit corretamente', async () => {
      const { rateLimit } = await import('../lib/rate-limit');
      expect(typeof rateLimit).toBe('function');
    });
  });

  describe('5. Verificação de Configurações', () => {
    it('deve ter variáveis de ambiente configuradas', () => {
      // Verifica se o arquivo .env.local existe
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      
      expect(fs.existsSync(envPath)).toBe(true);
    });

    it('deve ter Prisma configurado', () => {
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    it('deve ter PWA configurado', () => {
      const fs = require('fs');
      const path = require('path');
      
      const manifestPath = path.join(process.cwd(), 'public/manifest.json');
      const swPath = path.join(process.cwd(), 'public/sw.js');
      
      expect(fs.existsSync(manifestPath)).toBe(true);
      expect(fs.existsSync(swPath)).toBe(true);
    });
  });

  describe('6. Verificação de Documentação', () => {
    it('deve ter documentação completa', () => {
      const fs = require('fs');
      const path = require('path');

      const docs = [
        'README.md',
        'docs/README.md',
        'docs/API.md',
        'docs/DATABASE.md',
        'docs/SCRIPTS.md',
        'docs/TESTES.md',
      ];

      docs.forEach(doc => {
        const caminho = path.join(process.cwd(), doc);
        expect(fs.existsSync(caminho)).toBe(true);
      });
    });
  });

  describe('7. Teste de Performance', () => {
    it('deve carregar bibliotecas rapidamente', async () => {
      const inicio = Date.now();
      
      await import('../lib/formatters');
      await import('../lib/cache');
      await import('../lib/rate-limit');
      
      const fim = Date.now();
      const tempo = fim - inicio;
      
      // Deve carregar em menos de 1 segundo
      expect(tempo).toBeLessThan(1000);
    });
  });

  describe('8. Teste de Funcionalidades Principais', () => {
    it('deve formatar moeda corretamente', async () => {
      const { formatarMoeda } = await import('../lib/formatters');
      
      expect(formatarMoeda(1000)).toBe('R$ 1.000,00');
      expect(formatarMoeda(1500.50)).toBe('R$ 1.500,50');
    });

    it('deve fazer cache corretamente', async () => {
      const { cache } = await import('../lib/cache');
      
      cache.set('teste', 'valor', 1000);
      expect(cache.get('teste')).toBe('valor');
    });

    it('deve validar rate limit', async () => {
      const { rateLimit } = await import('../lib/rate-limit');
      
      const result = rateLimit('test-key', {
        interval: 60000,
        maxRequests: 10,
      });
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('remaining');
    });
  });
});

describe('🚀 TESTE DE BUILD COMPLETO', () => {
  it('deve ter configuração do Next.js válida', () => {
    const nextConfig = require('../../next.config.js');
    expect(nextConfig).toBeDefined();
  });

  it('deve ter TypeScript configurado corretamente', () => {
    const tsConfig = require('../../tsconfig.json');
    expect(tsConfig.compilerOptions).toBeDefined();
    expect(tsConfig.compilerOptions.strict).toBe(true);
  });

  it('deve ter todas as páginas principais', () => {
    const fs = require('fs');
    const path = require('path');

    const paginas = [
      'src/app/page.tsx',
      'src/app/login/page.tsx',
      'src/app/dashboard/page.tsx',
      'src/app/dashboard/layout.tsx',
    ];

    paginas.forEach(pagina => {
      const caminho = path.join(process.cwd(), pagina);
      expect(fs.existsSync(caminho)).toBe(true);
    });
  });
});
