# 🔧 Scripts - Finanças UP

Documentação completa de todos os scripts disponíveis no projeto.

## 📋 Índice

1. [Scripts NPM](#scripts-npm)
2. [Scripts de Teste](#scripts-de-teste)
3. [Scripts de Banco de Dados](#scripts-de-banco-de-dados)
4. [Scripts de Deploy](#scripts-de-deploy)
5. [Scripts Utilitários](#scripts-utilitários)

---

## 📦 Scripts NPM

### **Desenvolvimento**

#### `npm run dev`
Inicia o servidor de desenvolvimento

```bash
npm run dev
```

**Quando usar:**
- Durante o desenvolvimento
- Para testar mudanças localmente
- Acessa em http://localhost:3000

**Características:**
- Hot reload automático
- Source maps
- Modo de desenvolvimento

---

#### `npm run build`
Cria build de produção

```bash
npm run build
```

**Quando usar:**
- Antes de fazer deploy
- Para testar build de produção localmente
- Antes de commits importantes

**Processo:**
1. Gera Prisma Client
2. Compila TypeScript
3. Otimiza assets
4. Cria bundle de produção

---

#### `npm start`
Inicia servidor de produção

```bash
npm start
```

**Quando usar:**
- Após fazer build
- Para testar build localmente
- Em produção (Vercel faz isso automaticamente)

**Requisitos:**
- Executar `npm run build` antes

---

### **Testes**

#### `npm test`
Executa todos os testes

```bash
npm test
```

**Quando usar:**
- Antes de commits
- Após mudanças no código
- Para verificar se tudo está funcionando

**Características:**
- Executa todos os 233 testes
- Mostra coverage
- Falha se algum teste falhar

---

#### `npm run test:watch`
Executa testes em modo watch

```bash
npm run test:watch
```

**Quando usar:**
- Durante desenvolvimento de testes
- Para feedback imediato
- TDD (Test-Driven Development)

---

#### `npm run test:coverage`
Executa testes com relatório de coverage

```bash
npm run test:coverage
```

**Quando usar:**
- Para verificar cobertura de testes
- Antes de releases
- Para identificar código não testado

**Saída:**
- Relatório em `coverage/`
- HTML em `coverage/lcov-report/index.html`

---

#### `npm run verify`
Executa testes + build (verificação completa)

```bash
npm run verify
```

**Quando usar:**
- Antes de commits importantes
- Antes de pull requests
- Antes de deploy

**Processo:**
1. Executa todos os testes
2. Executa build completo
3. Falha se qualquer etapa falhar

---

### **Qualidade de Código**

#### `npm run lint`
Executa ESLint

```bash
npm run lint
```

**Quando usar:**
- Para verificar problemas de código
- Antes de commits
- Para manter padrão de código

---

#### `npm run lint:fix`
Corrige problemas de lint automaticamente

```bash
npm run lint:fix
```

**Quando usar:**
- Para corrigir problemas simples
- Após mudanças grandes
- Para formatar código

---

### **Banco de Dados (Prisma)**

#### `npm run prisma:generate`
Gera Prisma Client

```bash
npm run prisma:generate
```

**Quando usar:**
- Após mudanças no schema.prisma
- Após pull de mudanças
- Antes de executar o projeto

---

#### `npm run prisma:push`
Sincroniza schema com banco de dados

```bash
npm run prisma:push
```

**Quando usar:**
- Durante desenvolvimento
- Para aplicar mudanças rápidas
- Não recomendado para produção

**⚠️ Atenção:**
- Pode causar perda de dados
- Use migrations em produção

---

#### `npm run prisma:migrate`
Cria e aplica migration

```bash
npm run prisma:migrate dev --name nome-da-migration
```

**Quando usar:**
- Para mudanças em produção
- Para manter histórico de mudanças
- Recomendado sempre

---

#### `npm run prisma:studio`
Abre Prisma Studio (GUI do banco)

```bash
npm run prisma:studio
```

**Quando usar:**
- Para visualizar dados
- Para editar dados manualmente
- Para debug

**Acesso:**
- http://localhost:5555

---

### **Pre-commit**

#### `npm run pre-commit`
Executa verificações antes do commit

```bash
npm run pre-commit
```

**Quando usar:**
- Automático via Git hooks
- Manualmente antes de commits

**Processo:**
1. Executa testes
2. Executa build
3. Verifica lint
4. Verifica tipos TypeScript

**Configuração:**
- Arquivo: `scripts/pre-commit.js`
- Instalado automaticamente

---

## 🧪 Scripts de Teste

### **Testes Unitários**

Localizados em `src/lib/__tests__/`

```bash
# Executar teste específico
npm test -- backup.test.ts

# Executar testes de um diretório
npm test -- src/lib/__tests__/

# Executar com verbose
npm test -- --verbose
```

---

### **Testes de Integração**

Localizados em `scripts/testes/`

```bash
# Executar todos
npm test

# Executar específico
npm test -- scripts/testes/cache.test.ts
```

---

## 🗄️ Scripts de Banco de Dados

### **Backup Manual**

```bash
# Criar backup
node scripts/backup-db.js

# Restaurar backup
node scripts/restore-db.js backup-2025-01-19.sql
```

---

### **Seed (Popular banco)**

```bash
# Popular com dados de exemplo
npx prisma db seed
```

**Quando usar:**
- Ambiente de desenvolvimento
- Testes
- Demonstrações

---

### **Reset (Limpar banco)**

```bash
# Limpar e recriar banco
npx prisma migrate reset
```

**⚠️ ATENÇÃO:**
- Apaga TODOS os dados
- Só use em desenvolvimento
- Não use em produção

---

## 🚀 Scripts de Deploy

### **Deploy Vercel**

```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

---

### **Build Docker**

```bash
# Build imagem
docker build -t financas-up .

# Executar container
docker run -p 3000:3000 financas-up
```

---

## 🛠️ Scripts Utilitários

### **Limpar Cache**

```bash
# Limpar .next
rm -rf .next

# Limpar node_modules
rm -rf node_modules
npm install

# Limpar tudo
npm run clean
```

---

### **Atualizar Dependências**

```bash
# Verificar atualizações
npm outdated

# Atualizar minor/patch
npm update

# Atualizar major (cuidado!)
npm install <package>@latest
```

---

### **Gerar Documentação**

```bash
# Gerar docs da API
npm run docs:api

# Gerar docs do código
npm run docs:code
```

---

## 📊 Scripts de Análise

### **Bundle Analyzer**

```bash
# Analisar tamanho do bundle
npm run analyze
```

---

### **Performance**

```bash
# Lighthouse CI
npm run lighthouse

# Performance test
npm run perf
```

---

## 🔍 Scripts de Debug

### **Debug Mode**

```bash
# Executar com debug
NODE_OPTIONS='--inspect' npm run dev

# Debug de testes
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

### **Logs**

```bash
# Ver logs em tempo real
npm run logs

# Ver logs de erro
npm run logs:error
```

---

## 📝 Criar Novos Scripts

### **Adicionar ao package.json**

```json
{
  "scripts": {
    "meu-script": "node scripts/meu-script.js"
  }
}
```

### **Executar**

```bash
npm run meu-script
```

---

## 🎯 Fluxo de Trabalho Recomendado

### **Desenvolvimento Diário**

```bash
# 1. Atualizar código
git pull

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Iniciar desenvolvimento
npm run dev
```

---

### **Antes de Commit**

```bash
# 1. Executar testes
npm test

# 2. Verificar lint
npm run lint

# 3. Executar build
npm run build

# 4. Ou usar verify (faz tudo)
npm run verify
```

---

### **Deploy**

```bash
# 1. Verificar tudo
npm run verify

# 2. Commit
git add .
git commit -m "feat: nova funcionalidade"

# 3. Push
git push origin main

# 4. Deploy automático no Vercel
# Ou manual: vercel --prod
```

---

## 🚨 Troubleshooting

### **Erro: Cannot find module**

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

### **Erro: Prisma Client not found**

```bash
# Gerar Prisma Client
npm run prisma:generate
```

---

### **Erro: Port 3000 already in use**

```bash
# Matar processo na porta 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

### **Erro: Build failed**

```bash
# Limpar cache e rebuildar
rm -rf .next
npm run build
```

---

## 📚 Referências

- [Next.js Scripts](https://nextjs.org/docs/api-reference/cli)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [Jest CLI](https://jestjs.io/docs/cli)

---

**Última atualização:** 19/01/2025
