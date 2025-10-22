# 🔧 SCRIPTS E COMANDOS - FINANÇAS UP

**Organização Atualizada:** Scripts reorganizados por categorias em `scripts/`

---

## 📋 ESTRUTURA DE SCRIPTS ORGANIZADA

### 📁 Scripts por Categoria

```
scripts/
├── build/           # Build e otimização
├── database/        # Banco de dados e migrações
├── setup/           # Configuração inicial
├── auth/            # Autenticação e segurança
├── data/            # Dados e seeds
├── quality/         # Qualidade e testes
├── install/         # Instalação
└── utils/           # Utilitários diversos
```

## 🚀 SCRIPTS DISPONÍVEIS

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

### Qualidade e Testes

```bash
# Executar todos os testes
npm test

# Testes em watch mode
npm run test:watch

# Testes com cobertura
npm run test:coverage

# Testes de integração
npm run test:integration

# Testes de CI
npm run test:ci

# Testes de build
npm run test:build

# Testes otimizados
npm run test:optimized
```

### Banco de Dados

```bash
# Configurar para desenvolvimento local (SQLite)
npm run db:local

# Configurar para produção (Supabase)
npm run db:supabase

# Popular banco com dados de teste
npm run seed

# Resetar banco completamente
npm run reset-db

# Diagnóstico de saldos
npm run diagnostico

# Scripts específicos em scripts/database/
```

### Build e Deploy

```bash
# Build específico Netlify
npm run build:netlify

# Build local
npm run build:local

# Scripts de otimização em scripts/build/
```

### Utilitários

```bash
# Limpar banco seletivamente
npm run limpar-seletivo

# Zerar saldos de contas
npm run zerar-saldos

# Ajustar saldo inicial
npm run ajustar-saldo

# Scripts diversos em scripts/utils/
```

## 🔧 SCRIPTS POR CATEGORIA DETALHADOS

### 🏗️ Build (`scripts/build/`)
Scripts relacionados a compilação e otimização:

- `test-build.js` - Testa processo de build
- `test-optimized.js` - Testes otimizados
- `build-netlify.js` - Build específico Netlify

### 🗄️ Database (`scripts/database/`)
Scripts de banco de dados e migrações:

- `configure-prisma.js` - Configuração Prisma
- `configure-prisma-netlify.js` - Configuração Netlify
- `reset-banco-completo.ts` - Reset completo
- `reset-and-seed.ts` - Reset e popular dados
- `verificar-reparar-banco.ts` - Verificação e reparo

### ⚙️ Setup (`scripts/setup/`)
Scripts de configuração inicial:

- `setup-netlify.js` - Configuração Netlify
- `setup-sqlite.js` - Configuração SQLite
- `configurar-env.js` - Configuração ambiente

### 🔐 Auth (`scripts/auth/`)
Scripts de autenticação:

- `gerar-nextauth-secret.js` - Gerar segredo NextAuth
- `testar-login.ts` - Testar login

### 📊 Data (`scripts/data/`)
Scripts de dados:

- `gerar-dados-teste.ts` - Gerar dados de teste

### ✅ Quality (`scripts/quality/`)
Scripts de qualidade:

- `pre-commit.js` - Hooks de pre-commit
- `test-detailed.js` - Testes detalhados

### 📦 Install (`scripts/install/`)
Scripts de instalação (se aplicável)

### 🛠️ Utils (`scripts/utils/`)
Utilitários diversos:

- `alternar-db.js` - Alternar entre bancos
- Scripts de backup, limpeza, etc.

## 📝 COMANDOS IMPORTANTES

### Desenvolvimento Rápido
```bash
npm run dev                    # Iniciar desenvolvimento
npm test                       # Executar testes
npm run build                  # Build de produção
```

### Manutenção
```bash
npm run diagnostico           # Diagnosticar problemas
npm run reset-db              # Resetar banco
npm run seed                  # Popular dados
```

### Deploy
```bash
npm run build:netlify         # Build Netlify
npm run db:supabase          # Configurar Supabase
```

## ⚠️ NOTAS IMPORTANTES

- Scripts foram reorganizados após reestruturação do projeto
- Todos os caminhos em `package.json` foram atualizados
- Testes foram movidos para pasta `teste/` centralizada
- Documentação de testes disponível em `teste/DOCUMENTACAO-TESTES.md`

## 📋 RESUMO DE MUDANÇAS

### Antes da Reorganização
Scripts estavam todos na raiz da pasta `scripts/`

### Após Reorganização
Scripts categorizados em subpastas temáticas:
- `build/` - Compilação e otimização
- `database/` - Banco de dados
- `setup/` - Configuração inicial
- `auth/` - Autenticação
- `data/` - Dados e seeds
- `quality/` - Qualidade e testes
- `utils/` - Utilitários

### Benefícios
- ✅ Melhor organização
- ✅ Fácil localização
- ✅ Manutenção simplificada
- ✅ Scripts relacionados agrupados
