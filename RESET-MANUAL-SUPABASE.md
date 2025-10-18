# 🔄 RESET MANUAL DO SUPABASE (VIA DASHBOARD)

## ⚠️ PROBLEMA

A conexão via código está falhando. Vamos fazer o reset manualmente pelo Dashboard do Supabase.

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ ACESSAR O SUPABASE DASHBOARD

1. Acesse: https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco
2. Faça login se necessário
3. Verifique se o projeto está **ATIVO** (não pausado)

---

### 2️⃣ DELETAR TODAS AS TABELAS

**Opção A: Via SQL Editor (Mais Rápido)**

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New query**
3. Cole o seguinte SQL:

```sql
-- DELETAR TODAS AS TABELAS
DROP TABLE IF EXISTS "logs_acesso" CASCADE;
DROP TABLE IF EXISTS "convites_compartilhamento" CASCADE;
DROP TABLE IF EXISTS "compartilhamentos_conta" CASCADE;
DROP TABLE IF EXISTS "conciliacoes" CASCADE;
DROP TABLE IF EXISTS "metas" CASCADE;
DROP TABLE IF EXISTS "orcamentos" CASCADE;
DROP TABLE IF EXISTS "investimentos" CASCADE;
DROP TABLE IF EXISTS "parcelas_emprestimo" CASCADE;
DROP TABLE IF EXISTS "emprestimos" CASCADE;
DROP TABLE IF EXISTS "pagamentos_fatura" CASCADE;
DROP TABLE IF EXISTS "transacoes" CASCADE;
DROP TABLE IF EXISTS "faturas" CASCADE;
DROP TABLE IF EXISTS "cartoes_credito" CASCADE;
DROP TABLE IF EXISTS "contas_bancarias" CASCADE;
DROP TABLE IF EXISTS "categorias" CASCADE;
DROP TABLE IF EXISTS "usuarios" CASCADE;
```

4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a confirmação

**Opção B: Via Table Editor (Mais Lento)**

1. No menu lateral, clique em **Table Editor**
2. Para cada tabela que aparecer:
   - Clique nos 3 pontinhos (⋮) ao lado do nome
   - Clique em **Delete table**
   - Confirme a exclusão

---

### 3️⃣ CRIAR TODAS AS TABELAS

1. Ainda no **SQL Editor**, clique em **New query**
2. Abra o arquivo: `c:\Users\foxgt\CascadeProjects\financas-up\scripts\utils\banco-completo-corrigido.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no SQL Editor do Supabase
5. Clique em **Run** (ou Ctrl+Enter)
6. Aguarde a execução (pode demorar alguns segundos)

---

### 4️⃣ VERIFICAR SE AS TABELAS FORAM CRIADAS

1. Vá em **Table Editor** no menu lateral
2. Você deve ver **16 tabelas**:
   - usuarios
   - categorias
   - contas_bancarias
   - cartoes_credito
   - faturas
   - pagamentos_fatura
   - transacoes
   - emprestimos
   - parcelas_emprestimo
   - investimentos
   - orcamentos
   - metas
   - conciliacoes
   - compartilhamentos_conta
   - convites_compartilhamento
   - logs_acesso

---

### 5️⃣ POPULAR O BANCO COM DADOS DE TESTE

Volte para o terminal local e execute:

```bash
npm run seed
```

**Resultado esperado:**
```
✅ Usuário criado: teste@financasup.com
✅ Categorias criadas: 8
✅ Contas bancárias criadas: 3
✅ Cartões de crédito criados: 2
...
```

---

### 6️⃣ TESTAR A APLICAÇÃO

```bash
npm run dev
```

Acesse: http://localhost:3000

**Login:**
- Email: teste@financasup.com
- Senha: 123456

---

## 🔍 VERIFICAÇÃO FINAL

Execute localmente:

```bash
node verificar-schema-supabase.js
```

**Resultado esperado:**
```
✅ Tabelas OK: 11
⚠️  Tabelas vazias: 5 (normal)
❌ Tabelas com erro: 0
```

---

## ⚠️ SE DER ERRO NO SEED

Se o `npm run seed` falhar com erro de conexão:

### Verificar URL no Supabase Dashboard:

1. Vá em **Settings** → **Database**
2. Role até **Connection string**
3. Copie a **Connection string** (URI)
4. Verifique qual porta está usando:
   - **5432** = Direct connection (use esta!)
   - **6543** = Pooler (pode dar problema)

### Atualizar .env.supabase:

Edite: `c:\Users\foxgt\CascadeProjects\financas-up\.env.supabase`

```env
DATABASE_URL="postgresql://postgres.lfzqihajyvmdwrjtefco:SUA_SENHA@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Importante:**
- Use porta **5432**
- Substitua `SUA_SENHA` pela senha correta
- Não duplique `DATABASE_URL=`

Depois:
```bash
copy .env.supabase .env
npm run seed
```

---

## 📝 RESUMO DOS COMANDOS

```bash
# 1. Popular banco (após criar tabelas no Dashboard)
npm run seed

# 2. Testar aplicação
npm run dev

# 3. Verificar schema
node verificar-schema-supabase.js
```

---

## 🎯 CHECKLIST

- [ ] Acessei o Supabase Dashboard
- [ ] Deletei todas as tabelas (SQL ou manualmente)
- [ ] Executei o SQL completo (banco-completo-corrigido.sql)
- [ ] Verifiquei que 16 tabelas foram criadas
- [ ] Executei `npm run seed` com sucesso
- [ ] Testei login na aplicação
- [ ] Tudo funcionando!

---

## 💡 DICA

Se você preferir fazer tudo via Dashboard sem usar o terminal:

1. Delete as tabelas pelo Dashboard
2. Crie as tabelas pelo SQL Editor
3. Insira dados manualmente via **Table Editor**
4. Ou use o seed local depois

---

**Desenvolvido com ❤️ por Finanças UP**
