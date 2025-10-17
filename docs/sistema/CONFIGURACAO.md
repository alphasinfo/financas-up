# ⚙️ Guia Completo de Configuração

> Configuração passo a passo do Finanças UP - Local, Supabase e Vercel

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Local](#configuração-local)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Configuração do Vercel](#configuração-do-vercel)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Editor de Código** - VS Code recomendado
- **Conta GitHub** - [Criar conta](https://github.com/)
- **Conta Supabase** - [Criar conta](https://supabase.com/)
- **Conta Vercel** - [Criar conta](https://vercel.com/)

---

## 💻 Configuração Local

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/financas-up.git
cd financas-up
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/financas_up"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Opcional - Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
```

### 4. Gere uma Chave Secreta

```bash
# No terminal, execute:
openssl rand -base64 32
```

Copie o resultado e cole em `NEXTAUTH_SECRET`.

### 5. Configure o Banco de Dados

```bash
# Gerar o Prisma Client
npx prisma generate

# Criar as tabelas no banco
npx prisma db push

# (Opcional) Abrir o Prisma Studio
npx prisma studio
```

### 6. Inicie o Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/)
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** financas-up
   - **Database Password:** Crie uma senha forte
   - **Region:** Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos

### 2. Obter a Connection String

1. No menu lateral, vá em **Settings** → **Database**
2. Role até **Connection String**
3. Selecione a aba **URI**
4. Copie a URL completa
5. Substitua `[YOUR-PASSWORD]` pela senha que você criou

Exemplo:
```
postgresql://postgres.abc123:SuaSenha@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Executar o Script SQL

1. No Supabase, vá em **SQL Editor**
2. Clique em **"+ New query"**
3. Abra o arquivo `scripts/banco-completo-corrigido.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **RUN** (ou Ctrl+Enter)
7. Aguarde a execução (pode demorar 10-20 segundos)

### 4. Verificar Tabelas Criadas

1. Vá em **Table Editor**
2. Você deve ver as tabelas:
   - usuarios
   - categorias
   - contas_bancarias
   - cartoes_credito
   - transacoes
   - faturas
   - emprestimos
   - investimentos
   - orcamentos
   - metas
   - conciliacoes

### 5. Atualizar .env Local

```env
DATABASE_URL="postgresql://postgres.abc123:SuaSenha@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 6. Testar Conexão

```bash
npx prisma db pull
```

Se não houver erros, está conectado!

---

## 🚀 Configuração do Vercel

### 1. Preparar o Projeto

Certifique-se de que o código está no GitHub:

```bash
git add .
git commit -m "Configuração inicial"
git push origin main
```

### 2. Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com/)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione seu repositório **financas-up**
4. Clique em **"Import"**

### 3. Configurar Variáveis de Ambiente

Na tela de configuração, clique em **"Environment Variables"**:

**Adicione as seguintes variáveis:**

```env
DATABASE_URL
```
Valor: Cole a connection string do Supabase (Transaction pooler)

```env
NEXTAUTH_URL
```
Valor: `https://seu-projeto.vercel.app` (será gerado após o deploy)

```env
NEXTAUTH_SECRET
```
Valor: Cole a mesma chave secreta do .env local

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Quando terminar, clique em **"Visit"**

### 5. Atualizar NEXTAUTH_URL

1. Copie a URL do seu projeto (ex: `https://financas-up.vercel.app`)
2. No Vercel, vá em **Settings** → **Environment Variables**
3. Edite `NEXTAUTH_URL` e cole a URL correta
4. Clique em **"Save"**
5. Vá em **Deployments**
6. Clique nos 3 pontinhos do último deploy
7. Clique em **"Redeploy"**

### 6. Testar o Site

Acesse seu site e faça o cadastro!

---

## 🔐 Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://...` |
| `NEXTAUTH_URL` | URL do seu site | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Chave secreta para JWT | `abc123...` |

### Opcionais (Email)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Email de envio | `seu@email.com` |
| `SMTP_PASS` | Senha do email | `senha-app` |

---

## 🐛 Troubleshooting

### Erro: "Tenant or user not found"

**Causa:** URL do banco de dados incorreta

**Solução:**
1. Verifique se a URL está correta
2. Use a connection string **Transaction** (porta 6543)
3. Certifique-se de substituir `[YOUR-PASSWORD]`

### Erro: "Column does not exist"

**Causa:** Banco de dados não foi criado corretamente

**Solução:**
1. Vá no Supabase SQL Editor
2. Execute o script `banco-completo-corrigido.sql`
3. Verifique se todas as tabelas foram criadas

### Erro: "Invalid credentials"

**Causa:** Usuário não existe no banco

**Solução:**
1. Cadastre-se novamente no site
2. Ou execute no Supabase SQL Editor:

```sql
-- Criar usuário de teste (senha: 123456)
INSERT INTO usuarios (id, nome, email, senha, "criadoEm", "atualizadoEm")
VALUES (
  gen_random_uuid()::text,
  'Admin',
  'admin@financasup.com',
  '$2a$10$rOZJQqVJ5qYxK.fJvnKOHO8YvJKqYqVJ5qYxK.fJvnKOHO8YvJKqY',
  NOW(),
  NOW()
);
```

### Erro: "Build failed" no Vercel

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Vá em Settings → Environment Variables
2. Adicione todas as variáveis obrigatórias
3. Faça Redeploy

### Site carrega mas não faz login

**Causa:** `NEXTAUTH_URL` incorreta

**Solução:**
1. Verifique se a URL está correta (com https://)
2. Não coloque `/` no final
3. Faça Redeploy após alterar

---

## ✅ Checklist Final

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado no Supabase
- [ ] Script SQL executado
- [ ] Projeto no GitHub
- [ ] Deploy no Vercel
- [ ] Variáveis de ambiente no Vercel
- [ ] Site funcionando
- [ ] Login funcionando
- [ ] Cadastro de conta funcionando

---

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas:

1. Verifique os logs no Vercel (Runtime Logs)
2. Verifique o console do navegador (F12)
3. Revise cada passo desta documentação
4. Abra uma issue no GitHub

---

**Configuração concluída! Agora você pode usar o sistema.** 🎉
