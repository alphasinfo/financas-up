# 🧪 Documentação de Testes

**Versão:** 1.3.0  
**Total de Testes:** 82  
**Cobertura:** ~90%  
**Status:** ✅ 100% Passando

---

## 📁 Estrutura de Testes

```
scripts/testes/
├── cache.test.ts                    # 30 testes - Sistema de cache
├── dashboard-optimized.test.ts      # 20 testes - Queries otimizadas
├── formatters.test.ts               # 22 testes - Formatadores
├── pagination-helper.test.ts        # 20 testes - Paginação
├── rate-limit.test.ts              # 12 testes - Rate limiting
└── validation-helper.test.ts        # 15 testes - Validação
```

---

## 🚀 Comandos de Teste

### Executar Todos os Testes
```bash
npm test
```

### Executar em Modo Watch
```bash
npm run test:watch
```

### Executar com Cobertura
```bash
npm run test:coverage
```

### Executar Análise Detalhada
```bash
npm run test:detailed
```

### Abrir Relatório de Cobertura
```bash
npm run test:coverage:open
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

### Documentação
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)

### Tutoriais
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

---

## ✅ Checklist de Testes

Antes de fazer commit:
- [ ] Todos os testes passando (`npm test`)
- [ ] Cobertura > 80% (`npm run test:coverage`)
- [ ] Sem warnings (`npm run lint`)
- [ ] Build funcionando (`npm run build`)

---

**Última Atualização:** 2025-01-19  
**Próxima Revisão:** 2025-02-01
