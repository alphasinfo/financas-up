# 📘 INSTALAÇÃO COMPLETA - FINANÇAS UP

**Tempo estimado:** 20-30 minutos

---

## 📋 PRÉ-REQUISITOS

### Obrigatórios

- **Node.js** 18.0.0 ou superior
- **npm** 9.0.0 ou superior
- **Git** 2.30.0 ou superior
- **PostgreSQL** 15.0 ou superior (ou conta Supabase)

### Opcionais

- **VS Code** (recomendado)
- **Docker** (para PostgreSQL local)
- **Postman** ou **Insomnia** (para testar APIs)

---

## 🔍 VERIFICAR PRÉ-REQUISITOS

```bash
# Verificar Node.js
node --version  # Deve ser >= 18.0.0

# Verificar npm
npm --version   # Deve ser >= 9.0.0

# Verificar Git
git --version   # Deve ser >= 2.30.0

# Verificar PostgreSQL (se local)
psql --version  # Deve ser >= 15.0
```

---

## 📥 INSTALAÇÃO

### 1. Clonar Repositório

```bash
# HTTPS
git clone https://github.com/alphasinfo/financas-up.git

# SSH (se configurado)
git clone git@github.com:alphasinfo/financas-up.git

# Entrar na pasta
cd financas-up
```

### 2. Instalar Dependências

```bash
npm install
```

**Tempo:** ~2-3 minutos

**O que instala:**
- Next.js 14.2.18
- React 18.3.1
- Prisma 5.22.0
- NextAuth.js 4.24.11
- TailwindCSS 3.4.17
- E mais 1.177 pacotes

---

## 🗄️ CONFIGURAR BANCO DE DADOS

### Opção A: Supabase (Recomendado)

#### 1. Criar Conta

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub

#### 2. Criar Projeto

1. Clique em "New Project"
2. Preencha:
   - **Name:** financas-up
   - **Database Password:** (anote a senha!)
   - **Region:** South America (São Paulo)
   - **Plan:** Free
3. Clique em "Create new project"
4. Aguarde ~2 minutos

#### 3. Obter URL de Conexão

1. No projeto, vá em **Settings** → **Database**
2. Em "Connection string", selecione **URI**
3. Copie a URL (formato: `postgresql://postgres:[YOUR-PASSWORD]@...`)
4. Substitua `[YOUR-PASSWORD]` pela senha do passo 2

**Exemplo:**
```
postgresql://postgres:SuaSenha123@db.abc123xyz.supabase.co:5432/postgres
```

### Opção B: PostgreSQL Local

#### Windows

```powershell
# Baixar PostgreSQL
# https://www.postgresql.org/download/windows/

# Após instalação, criar banco
psql -U postgres
CREATE DATABASE financas_up;
\q
```

#### Linux (Ubuntu/Debian)

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco
sudo -u postgres psql
CREATE DATABASE financas_up;
\q
```

#### macOS

```bash
# Instalar via Homebrew
brew install postgresql@15

# Iniciar serviço
brew services start postgresql@15

# Criar banco
createdb financas_up
```

#### Docker

```bash
# Criar container PostgreSQL
docker run --name financas-up-db \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=financas_up \
  -p 5432:5432 \
  -d postgres:15

# Verificar se está rodando
docker ps
```

**URL de Conexão Local:**
```
postgresql://postgres:senha123@localhost:5432/financas_up
```

---

## ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE

### 1. Copiar Arquivo de Exemplo

```bash
cp .env.example .env
```

### 2. Editar .env

```bash
# Windows
notepad .env

# Linux/macOS
nano .env
# ou
code .env  # VS Code
```

### 3. Configurar Variáveis Essenciais

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gerar-com-comando-abaixo"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Gerar NEXTAUTH_SECRET

```bash
node scripts/gerar-nextauth-secret.js
```

Copie o secret gerado e cole no `.env`

### 5. Variáveis Opcionais

```env
# Email (opcional - para relatórios)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# Sentry (opcional - monitoramento)
SENTRY_DSN="https://..."

# Vercel (opcional - analytics)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

---

## 🔧 CONFIGURAR PRISMA

### 1. Gerar Prisma Client

```bash
npx prisma generate
```

**O que faz:** Gera o cliente TypeScript do Prisma

### 2. Aplicar Schema no Banco

```bash
npx prisma db push
```

**O que faz:** Cria todas as tabelas no banco de dados

**Tabelas criadas:**
- Usuario
- ContaBancaria
- CartaoCredito
- Transacao
- Categoria
- Emprestimo
- Investimento
- Orcamento
- Meta
- Fatura
- Compartilhamento
- Notificacao
- LogAcesso
- Backup

### 3. (Opcional) Popular com Dados de Teste

```bash
npm run seed
```

**O que cria:**
- 1 usuário de teste (email: teste@teste.com, senha: 123456)
- 3 contas bancárias
- 2 cartões de crédito
- 10 categorias padrão
- 20 transações de exemplo
- 2 orçamentos
- 1 meta financeira

### 4. Verificar Banco de Dados

```bash
npx prisma studio
```

**O que faz:** Abre interface visual do banco em http://localhost:5555

---

## 🚀 INICIAR APLICAÇÃO

### Modo Desenvolvimento

```bash
npm run dev
```

**Acesse:** http://localhost:3000

**Características:**
- ✅ Hot reload automático
- ✅ Source maps
- ✅ Logs detalhados
- ✅ Erros na tela

### Modo Produção

```bash
# Build
npm run build

# Iniciar
npm start
```

**Acesse:** http://localhost:3000

**Características:**
- ✅ Otimizado
- ✅ Minificado
- ✅ Cache agressivo
- ✅ Performance máxima

---

## ✅ VERIFICAR INSTALAÇÃO

### 1. Acessar Sistema

1. Abra http://localhost:3000
2. Deve ver a página inicial

### 2. Criar Conta

1. Clique em "Cadastrar"
2. Preencha os dados
3. Clique em "Criar conta"

### 3. Fazer Login

1. Use o email e senha cadastrados
2. Deve acessar o dashboard

### 4. Testar Funcionalidades

- [ ] Criar conta bancária
- [ ] Criar transação
- [ ] Ver dashboard
- [ ] Ver relatórios

---

## 🧪 EXECUTAR TESTES

```bash
# Todos os testes
npm test

# Watch mode
npm test:watch

# Com cobertura
npm test:coverage

# Testes de integração
npm test:integration
```

**Resultado esperado:**
```
Test Suites: 18 passed, 18 total
Tests:       256 passed, 256 total
```

---

## 🛠️ FERRAMENTAS ÚTEIS

### VS Code Extensions

Instale as extensões recomendadas:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server
npm run build            # Build de produção
npm start                # Iniciar produção
npm run lint             # Verificar código
npm run format           # Formatar código

# Banco de Dados
npx prisma studio        # Interface visual
npx prisma db push       # Aplicar schema
npx prisma generate      # Gerar client
npx prisma migrate dev   # Criar migration

# Testes
npm test                 # Executar testes
npm test:watch           # Watch mode
npm test:coverage        # Com cobertura

# Utilitários
npm run seed             # Popular banco
npm run backup           # Fazer backup
npm run restore          # Restaurar backup
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Cannot connect to database"

**Causa:** URL de conexão incorreta ou banco não está rodando

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list                # macOS
docker ps                         # Docker

# Testar conexão
psql "postgresql://usuario:senha@host:5432/banco"

# Verificar .env
cat .env | grep DATABASE_URL
```

### Erro: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**
```bash
# Usar outra porta
PORT=3001 npm run dev

# Ou matar processo na porta 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### Erro: "Prisma Client not generated"

**Causa:** Prisma Client não foi gerado

**Solução:**
```bash
npx prisma generate
```

### Erro: "NEXTAUTH_SECRET is not set"

**Causa:** Variável NEXTAUTH_SECRET não configurada

**Solução:**
```bash
node scripts/gerar-nextauth-secret.js
# Copiar secret gerado para .env
```

### Erro de Build

**Causa:** Erros de TypeScript ou ESLint

**Solução:**
```bash
# Verificar erros
npm run lint

# Corrigir automaticamente
npm run lint -- --fix

# Build com logs
npm run build -- --debug
```

---

## 📚 PRÓXIMOS PASSOS

1. **[Configuração do Sistema](03-CONFIGURACAO-SISTEMA.md)** - Configurações avançadas
2. **[Modo de Uso](04-MODO-DE-USO.md)** - Como usar o sistema
3. **[Arquitetura Técnica](05-ARQUITETURA-TECNICA.md)** - Entender a arquitetura

---

**📘 Instalação Completa Finalizada!**

**Tempo total:** ~20-30 minutos  
**Status:** ✅ Pronto para usar
