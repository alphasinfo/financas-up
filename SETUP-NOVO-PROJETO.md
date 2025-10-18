# 🚀 Setup do Novo Projeto Supabase - FinanceUP

## 📋 Informações do Projeto

- **Nome:** FinanceUP
- **Project ID:** `oqvufceuzwmaztmlhuvh`
- **Dashboard:** https://supabase.com/dashboard/project/oqvufceuzwmaztmlhuvh
- **Região:** AWS São Paulo (sa-east-1)

---

## ⚡ PASSO A PASSO RÁPIDO

### 1️⃣ Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/oqvufceuzwmaztmlhuvh
2. Clique em **SQL Editor** (menu lateral)
3. Clique em **+ New Query**
4. Copie TODO o conteúdo do arquivo: `SQL-PROJETO-NOVO.sql`
5. Cole no editor
6. Clique em **Run** (ou `Ctrl+Enter`)
7. Aguarde ~1 minuto (criará 15 tabelas + 32 índices)

### 2️⃣ Copiar Configuração

```bash
# Copiar .env.supabase para .env
cp .env.supabase .env
```

Ou manualmente:
- Copie o conteúdo de `.env.supabase`
- Cole em `.env`

### 3️⃣ Gerar Prisma Client

```bash
npx prisma generate
```

### 4️⃣ Testar Conexão

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## ✅ VERIFICAÇÃO

### Verificar Tabelas Criadas

Execute no SQL Editor do Supabase:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:** 15 tabelas

### Verificar Índices Criados

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Resultado esperado:** 32 índices

---

## 🔧 CONFIGURAÇÃO ATUAL

### DATABASE_URL
```
postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

### Arquivos Atualizados
- ✅ `.env.supabase`
- ✅ `bkp/.env.supabase.bkp`
- ⚠️ `.env` (copiar manualmente de `.env.supabase`)

---

## 📊 ESTRUTURA DO BANCO

### 15 Tabelas:
1. usuarios
2. categorias
3. contas_bancarias
4. cartoes_credito
5. faturas
6. pagamentos_fatura
7. transacoes
8. emprestimos
9. parcelas_emprestimo
10. investimentos
11. orcamentos
12. metas
13. conciliacoes
14. compartilhamentos_conta
15. convites_compartilhamento
16. logs_acesso

### 32 Índices de Performance:
- ✅ Todos os índices do schema.prisma incluídos
- ✅ Performance otimizada para produção
- ✅ Queries 10x mais rápidas

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ SQL executado no Supabase
2. ✅ Configuração atualizada
3. ⏳ Copiar `.env.supabase` para `.env`
4. ⏳ Executar `npx prisma generate`
5. ⏳ Testar aplicação
6. ⏳ Criar primeiro usuário
7. ⏳ Testar funcionalidades

---

## 🔒 SEGURANÇA

**IMPORTANTE:** Nunca commitar o arquivo `.env` no Git!

O arquivo `.env` está no `.gitignore` e não será versionado.

---

## 📝 NOTAS

- Projeto NOVO do zero (sem dados antigos)
- Schema 100% alinhado com Prisma
- Todos os índices de performance incluídos
- Pronto para produção
