# 🚀 GUIA DE SETUP LOCAL - FINANÇAS UP

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

---

## ⚡ SETUP RÁPIDO (Recomendado)

Execute o script automático:

```bash
node setup-dev-completo.js
```

Este script irá:
1. ✅ Verificar arquivo .env
2. ✅ Configurar schema para SQLite
3. ✅ Gerar Prisma Client
4. ✅ Criar banco de dados
5. ✅ Popular com dados de teste

---

## 🔧 SETUP MANUAL

### 1. Criar arquivo .env

Copie o `.env.example` e crie um `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o `.env` e configure:

```env
# Para desenvolvimento local com SQLite
DATABASE_URL="file:./dev.db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
```

### 2. Configurar banco de dados

**Opção A: SQLite (Recomendado para desenvolvimento)**

```bash
npm run db:local
npx prisma generate
npx prisma db push
npm run seed
```

**Opção B: PostgreSQL/Supabase**

```bash
# 1. Configure DATABASE_URL no .env com sua URL do Supabase
# 2. Execute:
npm run db:supabase
npx prisma generate
npx prisma db push
npm run seed
```

### 3. Iniciar servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 👤 CREDENCIAIS DE TESTE

Após executar o seed, use:

- **Email:** admin@financas.com
- **Senha:** admin123

---

## 🔄 ALTERNANDO ENTRE BANCOS

### SQLite → PostgreSQL

```bash
npm run db:supabase
npx prisma generate
npx prisma db push
```

### PostgreSQL → SQLite

```bash
npm run db:local
npx prisma generate
npx prisma db push
```

---

## ❌ PROBLEMAS COMUNS

### Erro: "Can't reach database server"

**Solução:** Verifique se o DATABASE_URL no `.env` está correto.

Para SQLite:
```env
DATABASE_URL="file:./dev.db"
```

Para Supabase:
```env
DATABASE_URL="postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Erro: "No users found" ao tentar logar

**Solução:**
```bash
npm run seed
```

### Erro: Build falha localmente mas funciona na Vercel

**Solução:** Isso é normal! O ambiente Windows pode ter diferenças de tipos do TypeScript. A Vercel usa Linux e compila corretamente.

---

## 📝 SCRIPTS ÚTEIS

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Iniciar servidor de produção

# Banco de dados
npm run db:local         # Configurar para SQLite
npm run db:supabase      # Configurar para PostgreSQL/Supabase
npm run seed             # Popular banco com dados de teste

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma db push       # Sincronizar schema com banco
npx prisma generate      # Gerar Prisma Client
npx prisma migrate dev   # Criar migration (PostgreSQL)

# Diagnóstico
node verify-project.js   # Verificar projeto completo
node setup-local-dev.js  # Verificar configuração local
```

---

## 🌐 DEPLOY NA VERCEL

1. Faça push para o GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` (URL do Supabase)
   - `NEXTAUTH_URL` (URL do seu app na Vercel)
   - `NEXTAUTH_SECRET` (gere com `openssl rand -base64 32`)

4. Deploy automático! ✨

---

## 📞 SUPORTE

Se encontrar problemas, verifique:

1. ✅ Arquivo `.env` existe e está configurado
2. ✅ `node_modules` instalado (`npm install`)
3. ✅ Prisma Client gerado (`npx prisma generate`)
4. ✅ Banco de dados criado (`npx prisma db push`)
5. ✅ Dados de teste criados (`npm run seed`)

---

**Desenvolvido com ❤️ por Finanças UP**
