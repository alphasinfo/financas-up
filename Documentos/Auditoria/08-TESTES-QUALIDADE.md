# 🧪 TESTES E QUALIDADE - FINANÇAS UP

---

## 📊 COBERTURA DE TESTES

### Estatísticas

- **Total de Testes:** 256
- **Suites:** 18
- **Status:** 100% passando
- **Cobertura:** ~80%
- **Tempo:** ~4.5s

---

## 🧪 TIPOS DE TESTES

### Unitários

Testam funções e componentes isolados

**Localização:** `__tests__/unit/`

**Exemplo:**
```typescript
// __tests__/unit/formatters.test.ts
describe('formatCurrency', () => {
  it('deve formatar valor em BRL', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00');
  });
});
```

### Integração

Testam fluxos completos com banco de dados

**Localização:** `__tests__/integration/`

**Exemplo:**
```typescript
// __tests__/integration/transacoes.test.ts
describe('Transacoes API', () => {
  it('deve criar e buscar transação', async () => {
    const created = await POST('/api/transacoes', data);
    const fetched = await GET(`/api/transacoes/${created.id}`);
    expect(fetched).toEqual(created);
  });
});
```

### E2E (End-to-End)

Testam fluxos de usuário completos

**Localização:** `__tests__/e2e/`

**Exemplo:**
```typescript
// __tests__/e2e/login.test.ts
describe('Login Flow', () => {
  it('deve fazer login e acessar dashboard', async () => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'teste@teste.com');
    await page.fill('[name="senha"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 🚀 EXECUTAR TESTES

### Comandos

```bash
# Todos os testes
npm test

# Watch mode (desenvolvimento)
npm test:watch

# Com cobertura
npm test:coverage

# Apenas unitários
npm test -- --testPathPattern=unit

# Apenas integração
npm test:integration

# Apenas E2E
npm test:e2e

# Teste específico
npm test -- transacoes.test.ts
```

---

## 📝 ESCREVER TESTES

### Estrutura

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Nome do Módulo', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  afterEach(() => {
    // Cleanup após cada teste
  });

  it('deve fazer algo específico', () => {
    // Arrange
    const input = 'valor';
    
    // Act
    const result = funcao(input);
    
    // Assert
    expect(result).toBe('esperado');
  });
});
```

### Matchers Comuns

```typescript
// Igualdade
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Verdadeiro/Falso
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Números
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(5);

// Objetos
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ key: 'value' });

// Exceções
expect(() => funcao()).toThrow();
expect(() => funcao()).toThrow('mensagem');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

---

## 🔧 CONFIGURAÇÃO

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## 📊 COBERTURA

### Ver Relatório

```bash
npm test:coverage
```

**Abre:** `coverage/lcov-report/index.html`

### Métricas

- **Statements:** Linhas executadas
- **Branches:** Condições testadas
- **Functions:** Funções testadas
- **Lines:** Total de linhas

---

## ✅ QUALIDADE DE CÓDIGO

### ESLint

```bash
# Verificar
npm run lint

# Corrigir automaticamente
npm run lint -- --fix
```

### Prettier

```bash
# Verificar formatação
npm run format:check

# Formatar código
npm run format
```

### TypeScript

```bash
# Verificar tipos
npx tsc --noEmit
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
```

---

## 📋 CHECKLIST DE QUALIDADE

Antes de fazer commit:

- [ ] Todos os testes passando
- [ ] Cobertura > 70%
- [ ] ESLint sem erros
- [ ] TypeScript sem erros
- [ ] Código formatado (Prettier)
- [ ] Build funcionando

---

## 🎯 BOAS PRÁTICAS

### Testes

1. **Nomes descritivos:** `deve criar transação quando dados válidos`
2. **Arrange-Act-Assert:** Organizar testes em 3 partes
3. **Um assert por teste:** Focar em uma coisa
4. **Independentes:** Testes não devem depender uns dos outros
5. **Rápidos:** Testes devem executar rapidamente

### Código

1. **DRY:** Don't Repeat Yourself
2. **KISS:** Keep It Simple, Stupid
3. **YAGNI:** You Aren't Gonna Need It
4. **SOLID:** Princípios de design
5. **Clean Code:** Código limpo e legível

---

**🧪 Testes e Qualidade Documentados!**
