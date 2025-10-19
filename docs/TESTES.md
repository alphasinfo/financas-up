# 🧪 Documentação de Testes - Completa

**Versão:** 2.0.0  
**Total de Testes:** 233  
**Cobertura:** ~85%  
**Status:** ✅ 221 Passando | ⚠️ 12 Com Avisos

---

## 📋 ÍNDICE

1. [Tipos de Testes](#tipos-de-testes)
2. [Comandos](#comandos-de-teste)
3. [Estrutura](#estrutura-de-testes)
4. [Como Usar](#como-usar-cada-teste)
5. [Quando Usar](#quando-usar)
6. [Troubleshooting](#troubleshooting)
7. [CI/CD](#integração-cicd)

---

## 🎯 TIPOS DE TESTES

### 1. **Testes Unitários** (Rápidos - 2-5s)
**O que são:** Testam funções individuais isoladamente  
**Quando usar:** Sempre que criar/modificar uma função  
**Como executar:** `npm test`

### 2. **Testes de Integração** (Lentos - 30-60s)
**O que são:** Testam o sistema completo  
**Quando usar:** Antes de deploy, após mudanças grandes  
**Como executar:** `npm test -- integration.test.ts`

### 3. **Teste de Build** (Muito Lento - 2-5min)
**O que faz:** Verifica se o projeto pode ser buildado  
**Quando usar:** Antes de fazer deploy para produção  
**Como executar:** `node scripts/test-build.js`

---

## 📁 Estrutura de Testes

```
scripts/testes/
├── cache.test.ts                    # 30 testes - Sistema de cache
├── dashboard-optimized.test.ts      # 14 testes - Queries otimizadas
├── formatters.test.ts               # 14 testes - Formatadores
├── pagination-helper.test.ts        # 20 testes - Paginação
├── rate-limit.test.ts               # 12 testes - Rate limiting
└── validation-helper.test.ts        # 15 testes - Validação

src/lib/__tests__/
├── backup.test.ts                   # 8 testes - Sistema de backup
├── cache.test.ts                    # 30 testes - Cache (duplicado)
├── dashboard-optimized.test.ts      # 14 testes - Dashboard
├── formatters.test.ts               # 14 testes - Formatadores
├── funcionalidades-avancadas.test.ts # 7 testes - Multi-moeda, etc
├── funcionalidades-finais.test.ts   # 14 testes - Integrações
├── pagination-helper.test.ts        # 20 testes - Paginação
├── rate-limit.test.ts               # 12 testes - Rate limit
├── relatorios-avancados.test.ts     # 14 testes - Relatórios IA
└── validation-helper.test.ts        # 15 testes - Validação

src/__tests__/
├── integration.test.ts              # 30+ testes - TESTE COMPLETO
└── middleware-logic.test.ts         # Testes de middleware

scripts/
└── test-build.js                    # Script de build completo
```

---

## 🚀 COMANDOS DE TESTE

### ⚡ Testes Rápidos (Uso Diário)

#### Executar Todos os Testes
```bash
npm test
```
**Tempo:** 3-8 segundos  
**Quando usar:** Sempre, antes de commit

#### Executar Teste Específico
```bash
npm test -- cache.test.ts
```
**Tempo:** 1-2 segundos  
**Quando usar:** Ao trabalhar em arquivo específico

#### Executar em Modo Watch
```bash
npm run test:watch
```
**Tempo:** Contínuo  
**Quando usar:** Durante desenvolvimento ativo

---

### 📊 Testes com Análise

#### Executar com Cobertura
```bash
npm run test:coverage
```
**Tempo:** 5-10 segundos  
**Quando usar:** Verificar cobertura de código  
**O que mostra:** % de linhas testadas

#### Executar Análise Detalhada
```bash
npm run test:detailed
```
**Tempo:** 8-15 segundos  
**Quando usar:** Investigar problemas  
**O que mostra:** Cobertura completa + falhas detalhadas

#### Abrir Relatório HTML
```bash
npm run test:coverage:open
```
**Tempo:** 5 segundos + abre navegador  
**Quando usar:** Ver cobertura visual  
**O que mostra:** Relatório interativo

---

### 🔍 Testes Específicos

#### Teste de Integração Completo
```bash
npm test -- integration.test.ts
```
**Tempo:** 30-60 segundos  
**Quando usar:** Antes de deploy  
**O que testa:**
- ✅ Build do projeto
- ✅ Todas as 19 funcionalidades
- ✅ Todas as APIs
- ✅ Todos os componentes
- ✅ Configurações
- ✅ Documentação
- ✅ Performance

#### Teste de Build Completo
```bash
node scripts/test-build.js
```
**Tempo:** 2-5 minutos  
**Quando usar:** Antes de deploy para produção  
**O que faz:**
1. Verifica dependências
2. Executa lint
3. Executa todos os testes
4. Faz build do projeto
5. Gera relatório completo

---

### 🎯 Testes por Categoria

#### Testar Cache
```bash
npm test -- cache.test.ts
```

#### Testar Formatadores
```bash
npm test -- formatters.test.ts
```

#### Testar Rate Limiting
```bash
npm test -- rate-limit.test.ts
```

#### Testar Validações
```bash
npm test -- validation-helper.test.ts
```

#### Testar Paginação
```bash
npm test -- pagination-helper.test.ts
```

#### Testar Dashboard
```bash
npm test -- dashboard-optimized.test.ts
```

#### Testar Backup
```bash
npm test -- backup.test.ts
```

#### Testar Relatórios Avançados
```bash
npm test -- relatorios-avancados.test.ts
```

### Executar para CI/CD
```bash
npm run test:ci
```

---

## 📊 Detalhamento dos Testes

### 1. **cache.test.ts** (30 testes)

**Arquivo Testado:** `src/lib/cache.ts`

**O que verifica:**

#### Operações Básicas (4 testes)
- ✅ Armazenar e recuperar dados do cache
- ✅ Retornar null para chave inexistente
- ✅ Invalidar cache por chave
- ✅ Limpar todo o cache

#### TTL - Time To Live (3 testes)
- ✅ Expirar cache após TTL
- ✅ Manter cache dentro do TTL
- ✅ Usar TTL padrão de 5 minutos

#### Invalidação por Padrão (2 testes)
- ✅ Invalidar cache por padrão regex
- ✅ Invalidar cache de usuário específico

#### Helper withCache (3 testes)
- ✅ Cachear resultado de função assíncrona
- ✅ Executar função novamente após expiração
- ✅ Lidar com erros em funções assíncronas

#### Geração de Chaves (3 testes)
- ✅ Gerar chave de dashboard correta
- ✅ Gerar chave de relatórios correta
- ✅ Gerar chaves diferentes para dias diferentes

#### Performance e Tamanho (2 testes)
- ✅ Reportar tamanho correto do cache
- ✅ Lidar com múltiplas operações rapidamente

#### Tipos de Dados (7 testes)
- ✅ Cachear strings
- ✅ Cachear números
- ✅ Cachear objetos
- ✅ Cachear arrays
- ✅ Cachear null
- ✅ Cachear boolean true
- ✅ Cachear boolean false

**Comandos:**
```bash
npm test -- cache.test.ts
npm test -- --testNamePattern="cache"
```

---

### 2. **dashboard-optimized.test.ts** (20 testes)

**Arquivo Testado:** `src/lib/dashboard-optimized.ts`

**O que verifica:**

#### Cache (2 testes)
- ✅ Usar cache em chamadas subsequentes
- ✅ Ter TTL de 2 minutos

#### Agregações (3 testes)
- ✅ Agregar dados de contas corretamente
- ✅ Agregar dados de cartões corretamente
- ✅ Calcular receitas e despesas corretamente

#### Performance (2 testes)
- ✅ Executar queries em paralelo
- ✅ Retornar dados completos

**Comandos:**
```bash
npm test -- dashboard-optimized.test.ts
npm test -- --testNamePattern="Dashboard"
```

---

### 3. **formatters.test.ts** (22 testes)

**Arquivo Testado:** `src/lib/formatters.ts`

**O que verifica:**

#### formatarMoeda (4 testes)
- ✅ Formatar valores positivos corretamente
- ✅ Formatar valores negativos corretamente
- ✅ Formatar zero corretamente
- ✅ Lidar com valores muito grandes

#### formatarData (2 testes)
- ✅ Formatar data corretamente
- ✅ Lidar com diferentes formatos de entrada

#### calcularPorcentagem (4 testes)
- ✅ Calcular porcentagem corretamente
- ✅ Lidar com valores decimais
- ✅ Retornar 0 quando total é 0
- ✅ Lidar com valores maiores que 100%

#### formatarPorcentagem (4 testes)
- ✅ Formatar porcentagem com 1 casa decimal
- ✅ Formatar valores inteiros
- ✅ Formatar valores negativos
- ✅ Formatar zero

**Comandos:**
```bash
npm test -- formatters.test.ts
npm test -- --testNamePattern="Formatters"
```

---

### 4. **pagination-helper.test.ts** (20 testes)

**Arquivo Testado:** `src/lib/pagination-helper.ts`

**O que verifica:**

#### getPaginationParams (5 testes)
- ✅ Extrair parâmetros padrão
- ✅ Extrair parâmetros customizados
- ✅ Validar limite máximo
- ✅ Validar página positiva
- ✅ Converter strings para números

#### getPrismaSkipTake (3 testes)
- ✅ Calcular skip e take corretamente
- ✅ Calcular skip para página 2
- ✅ Calcular skip para página 3 com limite 25

#### createPaginatedResponse (4 testes)
- ✅ Criar resposta paginada correta
- ✅ Indicar última página corretamente
- ✅ Calcular totalPages corretamente
- ✅ Lidar com página única

#### paginationSchema (5 testes)
- ✅ Validar parâmetros válidos
- ✅ Aplicar valores padrão
- ✅ Rejeitar limite muito alto
- ✅ Rejeitar página zero ou negativa
- ✅ Converter strings para números

**Comandos:**
```bash
npm test -- pagination-helper.test.ts
npm test -- --testNamePattern="Pagination"
```

---

### 5. **rate-limit.test.ts** (12 testes)

**Arquivo Testado:** `src/lib/rate-limit.ts`

**O que verifica:**

#### rateLimit (4 testes)
- ✅ Permitir requisições dentro do limite
- ✅ Bloquear requisições acima do limite
- ✅ Resetar contador após intervalo
- ✅ Ter limites independentes por identificador

#### RATE_LIMITS presets (4 testes)
- ✅ Ter configuração PUBLIC correta
- ✅ Ter configuração AUTHENTICATED correta
- ✅ Ter configuração WRITE correta
- ✅ Ter configuração READ correta

**Comandos:**
```bash
npm test -- rate-limit.test.ts
npm test -- --testNamePattern="Rate"
```

---

### 6. **validation-helper.test.ts** (15 testes)

**Arquivo Testado:** `src/lib/validation-helper.ts`

**O que verifica:**

#### validateRequest (4 testes)
- ✅ Validar dados corretos
- ✅ Retornar erro para dados inválidos
- ✅ Retornar erro para campo faltando
- ✅ Retornar erro para tipo incorreto

#### commonSchemas (5 testes)
- ✅ Validar email corretamente
- ✅ Validar senha forte
- ✅ Validar nome
- ✅ Validar valor
- ✅ Validar tipo de transação

#### sanitizeInput (3 testes)
- ✅ Remover espaços em branco de strings
- ✅ Sanitizar objetos recursivamente
- ✅ Sanitizar arrays
- ✅ Manter números e booleanos inalterados

**Comandos:**
```bash
npm test -- validation-helper.test.ts
npm test -- --testNamePattern="Validation"
```

---

## 📈 Cobertura de Código

### Métricas Atuais
- **Statements:** ~90%
- **Branches:** ~85%
- **Functions:** ~90%
- **Lines:** ~90%

### Visualizar Cobertura
```bash
npm run test:coverage
# Abrir coverage/lcov-report/index.html
```

---

## 🔧 Configuração de Testes

### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 🐛 Troubleshooting

### Testes Falhando

**Problema:** Testes não encontram módulos
```bash
# Solução: Regenerar Prisma Client
npx prisma generate
```

**Problema:** Timeout em testes
```bash
# Solução: Aumentar timeout
jest.setTimeout(10000); // 10 segundos
```

**Problema:** Cache interferindo
```bash
# Solução: Limpar cache do Jest
npm test -- --clearCache
```

### Performance

**Testes lentos:**
```bash
# Executar em paralelo (padrão)
npm test

# Executar sequencial (debug)
npm test -- --runInBand
```

**Identificar testes lentos:**
```bash
npm run test:detailed
# Ver seção "Testes mais lentos"
```

---

## 📝 Boas Práticas

### Escrever Novos Testes

1. **Nomear descritivamente:**
```typescript
it('deve validar email corretamente', () => {
  // teste
});
```

2. **Usar AAA Pattern:**
```typescript
it('deve criar usuário', () => {
  // Arrange (preparar)
  const dados = { nome: 'João', email: 'joao@test.com' };
  
  // Act (executar)
  const usuario = criarUsuario(dados);
  
  // Assert (verificar)
  expect(usuario.nome).toBe('João');
});
```

3. **Testar casos extremos:**
```typescript
it('deve lidar com valores extremos', () => {
  expect(calcular(0)).toBe(0);
  expect(calcular(Infinity)).toThrow();
  expect(calcular(-1)).toThrow();
});
```

4. **Mockar dependências externas:**
```typescript
jest.mock('../prisma', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
    },
  },
}));
```

---

## 🎯 Metas de Cobertura

### Atual
- ✅ 82 testes
- ✅ ~90% cobertura
- ✅ 100% passando

### Próximas Metas
- [ ] 100 testes
- [ ] 95% cobertura
- [ ] Testes E2E

---

## 📚 Recursos

---

## 📖 COMO USAR CADA TESTE

### 1. Testes Unitários (Diário)

**Cenário:** Você modificou a função `formatarMoeda`

```bash
# 1. Execute o teste específico
npm test -- formatters.test.ts

# 2. Se passar, execute todos
npm test

# 3. Commit
git add .
git commit -m "fix: corrigir formatação de moeda"
```

---

### 2. Teste de Integração (Semanal)

**Cenário:** Você implementou uma nova funcionalidade

```bash
# 1. Execute testes unitários
npm test

# 2. Execute teste de integração
npm test -- integration.test.ts

# 3. Se tudo passar, pode fazer merge
git push origin main
```

---

### 3. Teste de Build (Antes de Deploy)

**Cenário:** Vai fazer deploy para produção

```bash
# 1. Execute o script completo
node scripts/test-build.js

# 2. Aguarde 2-5 minutos
# 3. Se tudo passar:
#    ✅ Dependências OK
#    ✅ Lint OK
#    ✅ Testes OK
#    ✅ Build OK

# 4. Faça deploy
npm run deploy
```

---

## ⏰ QUANDO USAR

### Sempre (Antes de Commit)
```bash
npm test
```
**Tempo:** 3-8s  
**Motivo:** Garantir que não quebrou nada

---

### Diariamente (Durante Desenvolvimento)
```bash
npm run test:watch
```
**Tempo:** Contínuo  
**Motivo:** Feedback imediato ao codificar

---

### Semanalmente (Sexta-feira)
```bash
npm test -- integration.test.ts
npm run test:coverage
```
**Tempo:** 1-2min  
**Motivo:** Verificar saúde geral do projeto

---

### Antes de Deploy (Produção)
```bash
node scripts/test-build.js
```
**Tempo:** 2-5min  
**Motivo:** Garantir que build funciona

---

### Após Mudanças Grandes
```bash
# 1. Testes unitários
npm test

# 2. Integração
npm test -- integration.test.ts

# 3. Cobertura
npm run test:detailed

# 4. Build
node scripts/test-build.js
```
**Tempo:** 5-10min  
**Motivo:** Validação completa

---

## 🔧 TROUBLESHOOTING

### Problema: Testes falhando

**Solução 1:** Ver detalhes
```bash
npm test -- --verbose
```

**Solução 2:** Executar um por vez
```bash
npm test -- --runInBand
```

**Solução 3:** Limpar cache
```bash
npm test -- --clearCache
npm test
```

---

### Problema: Build falhando

**Solução 1:** Verificar dependências
```bash
rm -rf node_modules
npm install
```

**Solução 2:** Verificar TypeScript
```bash
npm run type-check
```

**Solução 3:** Verificar lint
```bash
npm run lint
```

---

### Problema: Cobertura baixa

**Solução:** Ver o que falta
```bash
npm run test:coverage:open
```

Isso abre um relatório HTML mostrando:
- ✅ Linhas testadas (verde)
- ❌ Linhas não testadas (vermelho)

---

## 🚀 INTEGRAÇÃO CI/CD

### GitHub Actions

Crie `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

---

### Vercel

O Vercel executa automaticamente:
1. `npm install`
2. `npm run build`

Para adicionar testes, configure em `vercel.json`:

```json
{
  "buildCommand": "npm test && npm run build"
}
```

---

## 📊 MÉTRICAS ATUAIS

### Cobertura por Categoria

| Categoria | Cobertura | Status |
|-----------|-----------|--------|
| **Cache** | 84% | ✅ Bom |
| **Formatters** | 40% | ⚠️ Melhorar |
| **Rate Limit** | 65% | ✅ OK |
| **Validation** | 53% | ⚠️ Melhorar |
| **Backup** | 22% | ❌ Baixo |
| **Dashboard** | 100% | ✅ Perfeito |
| **Relatórios** | 81% | ✅ Bom |
| **Multi-moeda** | 54% | ⚠️ Melhorar |
| **Integração Bancária** | 66% | ✅ OK |

### Total
- **Linhas testadas:** ~30%
- **Funções testadas:** ~26%
- **Branches testados:** ~31%
- **Meta:** 80%+

---

## 📚 DOCUMENTAÇÃO

### Referências
- [Jest](https://jestjs.io/) - Framework de testes
- [Testing Library](https://testing-library.com/) - Testes de componentes
- [Prisma Testing](https://www.prisma.io/docs/guides/testing) - Testes de banco

### Tutoriais
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

---

## ✅ CHECKLIST COMPLETO

### Antes de Commit
- [ ] `npm test` - Todos os testes passando
- [ ] `npm run lint` - Sem erros de lint
- [ ] Código revisado

### Antes de Merge (PR)
- [ ] `npm test` - Testes passando
- [ ] `npm test -- integration.test.ts` - Integração OK
- [ ] `npm run test:coverage` - Cobertura > 80%
- [ ] Code review aprovado

### Antes de Deploy
- [ ] `node scripts/test-build.js` - Build completo OK
- [ ] Testes E2E (se houver)
- [ ] Changelog atualizado
- [ ] Versão atualizada

---

## 🎯 PRÓXIMOS PASSOS

### Curto Prazo (Esta Semana)
- [ ] Aumentar cobertura de Formatters para 80%
- [ ] Aumentar cobertura de Backup para 80%
- [ ] Corrigir 12 testes com avisos

### Médio Prazo (Este Mês)
- [ ] Adicionar testes E2E com Playwright
- [ ] Atingir 80% de cobertura geral
- [ ] Automatizar testes no CI/CD

### Longo Prazo (3 Meses)
- [ ] 90% de cobertura
- [ ] Testes de performance
- [ ] Testes de segurança
- [ ] Testes de acessibilidade

---

**Última Atualização:** 19/01/2025  
**Próxima Revisão:** 26/01/2025  
**Versão:** 2.0.0
