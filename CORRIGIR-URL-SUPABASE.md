# 🔧 CORREÇÃO DA URL DO SUPABASE

## ❌ PROBLEMA IDENTIFICADO

Erro: `prepared statement "s0" already exists`

**Causa:** A URL do Supabase está usando **pgbouncer em modo transaction**, que não suporta prepared statements do Prisma.

---

## ✅ SOLUÇÃO

Você tem 2 opções:

### OPÇÃO 1: Usar Conexão Direta (Recomendado para Migrations)

**URL Direta (porta 5432):**
```
postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### OPÇÃO 2: Usar Pooler com Session Mode (porta 6543)

**URL com Session Mode:**
```
postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## 🔍 COMO OBTER A URL CORRETA

1. Acesse: https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco
2. Vá em: **Settings** → **Database**
3. Role até **Connection string**
4. Você verá 2 opções:

### Connection Pooling (Transaction Mode) - NÃO USE PARA MIGRATIONS
```
postgresql://postgres.xxx:senha@aws-xxx.pooler.supabase.com:6543/postgres
```

### Direct Connection - USE ESTA PARA MIGRATIONS
```
postgresql://postgres.xxx:senha@aws-xxx.pooler.supabase.com:5432/postgres
```

---

## 🛠️ COMO CORRIGIR

### 1. Edite o arquivo `.env.supabase`:

Abra: `c:\Users\foxgt\CascadeProjects\financas-up\.env.supabase`

**Troque de:**
```env
DATABASE_URL="postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
```

**Para (Conexão Direta):**
```env
DATABASE_URL="postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

### 2. Copie para .env:
```bash
copy .env.supabase .env
```

### 3. Execute o reset:
```bash
node reset-supabase-manual.js
```

---

## 📝 DIFERENÇA ENTRE AS PORTAS

### Porta 5432 (Conexão Direta):
- ✅ Suporta migrations e db push
- ✅ Suporta prepared statements
- ✅ Melhor para desenvolvimento
- ⚠️ Limite de conexões menor

### Porta 6543 (Connection Pooling):
- ✅ Mais conexões simultâneas
- ✅ Melhor para produção
- ❌ NÃO suporta migrations
- ❌ NÃO suporta prepared statements (modo transaction)

---

## 🎯 RECOMENDAÇÃO

**Para Desenvolvimento/Migrations:**
- Use porta **5432** (conexão direta)

**Para Produção (Vercel):**
- Use porta **6543** (pooling) OU
- Use porta **5432** se tiver poucos usuários

---

## 🚀 APÓS CORRIGIR

Execute:
```bash
node reset-supabase-manual.js
```

Isso irá:
1. ✅ Deletar todas as tabelas
2. ✅ Recriar com o schema atual
3. ✅ Popular com dados de teste

---

**Desenvolvido com ❤️ por Finanças UP**
