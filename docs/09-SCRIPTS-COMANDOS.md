# 🔧 SCRIPTS E COMANDOS - FINANÇAS UP

---

## 📋 SCRIPTS DISPONÍVEIS

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# Acesso: http://localhost:3000
# Hot reload automático

# Build de produção
npm run build
# Gera arquivos otimizados em .next/

# Iniciar produção
npm start
# Requer build prévio
```

### Qualidade

```bash
# Executar testes
npm test

# Testes em watch mode
npm test:watch

# Testes com cobertura
npm test:coverage

# Verificar código (ESLint)
npm run lint

# Corrigir código automaticamente
npm run lint -- --fix

# Formatar código (Prettier)
npm run format
```

### Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema no banco
npx prisma db push

# Criar migration
npx prisma migrate dev --name nome

# Aplicar migrations (produção)
npx prisma migrate deploy

# Reset banco (CUIDADO!)
npx prisma migrate reset

# Interface visual do banco
npx prisma studio
# Acesso: http://localhost:5555

# Popular banco com dados de teste
npm run seed
```

### Utilitários

```bash
# Gerar NEXTAUTH_SECRET
node scripts/gerar-nextauth-secret.js

# Configurar .env interativo
node scripts/configurar-env.js

# Fazer backup
npm run backup

# Restaurar backup
npm run restore

# Testar build completo
node scripts/test-build.js

# Testes detalhados
node scripts/test-detailed.js
```

---

## 🛠️ SCRIPTS PERSONALIZADOS

### Localização

```
scripts/
├── database/              # Scripts de banco
│   ├── backup.js
│   └── restore.js
├── testes/                # Scripts de teste
│   ├── cache.test.ts
│   └── formatters.test.ts
├── utils/                 # Utilitários
│   ├── check-env.js
│   └── generate-secret.js
├── configurar-env.js      # Configurar .env
├── gerar-nextauth-secret.js
├── pre-commit.js          # Hook pre-commit
├── test-build.js          # Testar build
└── test-detailed.js       # Testes detalhados
```

### Executar Script

```bash
node scripts/nome-do-script.js
```

---

## 🔄 SCRIPTS DE INSTALAÇÃO

### Linux (Manjaro/Arch)

```bash
chmod +x scripts/manjaro/install.sh
./scripts/manjaro/install.sh
```

**O que faz:**
- Verifica Node.js
- Instala dependências
- Configura banco
- Gera Prisma Client
- Opção de seed

### Linux (Debian/Ubuntu)

```bash
chmod +x scripts/debian/install.sh
./scripts/debian/install.sh
```

### Windows

```powershell
# PowerShell como Administrador
.\scripts\windows\install.ps1
```

---

## 📦 PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "seed": "ts-node prisma/seed.ts",
    "backup": "node scripts/database/backup.js",
    "restore": "node scripts/database/restore.js"
  }
}
```

---

## 🔐 SCRIPTS DE SEGURANÇA

### Gerar Secret

```bash
node scripts/gerar-nextauth-secret.js
```

**Output:**
```
NEXTAUTH_SECRET gerado:
abc123def456...

Adicione ao .env:
NEXTAUTH_SECRET="abc123def456..."
```

### Verificar .env

```bash
node scripts/utils/check-env.js
```

**Verifica:**
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- Outras variáveis essenciais

---

## 💾 SCRIPTS DE BACKUP

### Fazer Backup

```bash
npm run backup
```

**Gera:**
- `backup-YYYY-MM-DD-HH-mm-ss.json`
- Contém todos os dados do usuário

### Restaurar Backup

```bash
npm run restore backup-2025-01-19.json
```

**Restaura:**
- Contas
- Transações
- Categorias
- Orçamentos
- Metas

---

## 🧪 SCRIPTS DE TESTE

### Teste Completo

```bash
node scripts/test-build.js
```

**Executa:**
1. Verifica dependências
2. Executa ESLint
3. Executa testes
4. Faz build
5. Gera relatório

**Output:**
```
==================================================
📊 RELATÓRIO FINAL
==================================================
✅ Dependências: OK
✅ Lint: OK
✅ Testes: OK (256/256)
✅ Build: OK
⏱️  Tempo total: 96.92s
==================================================
🎉 SUCESSO! Projeto pronto para deploy!
```

### Teste Detalhado

```bash
node scripts/test-detailed.js
```

**Testa:**
- Formatadores
- Validadores
- Cache
- APIs
- Componentes

---

## 🔄 GIT HOOKS

### Pre-commit

```bash
# Configurado automaticamente
# Executa antes de cada commit
```

**Verifica:**
- ESLint
- Prettier
- TypeScript
- Testes unitários

**Arquivo:** `scripts/pre-commit.js`

---

## 📊 SCRIPTS DE ANÁLISE

### Analisar Bundle

```bash
npm run analyze
```

**Gera:**
- Tamanho de cada pacote
- Dependências duplicadas
- Oportunidades de otimização

### Verificar Dependências

```bash
npm outdated
```

**Mostra:**
- Pacotes desatualizados
- Versões disponíveis
- Versões instaladas

---

## 🚀 SCRIPTS DE DEPLOY

### Build para Produção

```bash
npm run build
```

**Processo:**
1. Prisma generate
2. Next.js build
3. Otimização
4. Minificação

### Verificar Build

```bash
npm run start
```

**Testa:**
- Build em modo produção
- Performance
- Funcionalidades

---

## 📋 COMANDOS ÚTEIS

### Node.js

```bash
# Versão do Node
node --version

# Versão do npm
npm --version

# Limpar cache do npm
npm cache clean --force
```

### Git

```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "mensagem"

# Push
git push origin main

# Pull
git pull origin main
```

### Docker (PostgreSQL)

```bash
# Criar container
docker run --name financas-up-db \
  -e POSTGRES_PASSWORD=senha \
  -e POSTGRES_DB=financas_up \
  -p 5432:5432 \
  -d postgres:15

# Iniciar container
docker start financas-up-db

# Parar container
docker stop financas-up-db

# Ver logs
docker logs financas-up-db
```

---

## ✅ CHECKLIST DE SCRIPTS

Antes de deploy:

- [ ] `npm test` - Testes passando
- [ ] `npm run lint` - Sem erros
- [ ] `npm run build` - Build OK
- [ ] `node scripts/test-build.js` - Tudo OK

---

**🔧 Scripts e Comandos Documentados!**
