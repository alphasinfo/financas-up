# 🔄 GUIA DE SINCRONIZAÇÃO SUPABASE

## 📋 PROBLEMA IDENTIFICADO

O projeto roda localmente (SQLite) mas pode ter problemas na Vercel (PostgreSQL/Supabase) porque:

1. ❌ Tabelas podem não existir no Supabase
2. ❌ Schema local pode estar diferente do Supabase
3. ❌ Banco Supabase pode estar vazio

---

## 🔍 VERIFICAR ESTADO ATUAL

### 1. Verificar Schema do Supabase

```bash
node verificar-schema-supabase.js
```

**O que faz:**
- ✅ Conecta ao Supabase
- ✅ Verifica se todas as 16 tabelas existem
- ✅ Mostra quantos registros tem em cada tabela
- ✅ Identifica problemas

**Saída esperada:**
```
✅ usuarios                    1 registros
✅ categorias                  8 registros
✅ contas_bancarias            3 registros
...
```

---

## 🔄 SINCRONIZAR SCHEMA

### 2. Sincronizar com Supabase

```bash
node sync-supabase-schema.js
```

**O que faz:**
- ✅ Verifica configuração
- ✅ Gera Prisma Client
- ✅ Aplica mudanças no Supabase (cria/atualiza tabelas)
- ✅ Sincroniza schema completo

**ATENÇÃO:** Isso pode alterar tabelas no Supabase!

---

## 📊 TABELAS DO PROJETO

### 16 Tabelas Principais:

1. **usuarios** - Usuários do sistema
2. **categorias** - Categorias de transações
3. **contas_bancarias** - Contas bancárias
4. **cartoes_credito** - Cartões de crédito
5. **faturas** - Faturas dos cartões
6. **pagamentos_fatura** - Pagamentos de faturas
7. **transacoes** - Transações financeiras
8. **emprestimos** - Empréstimos
9. **parcelas_emprestimo** - Parcelas de empréstimos
10. **investimentos** - Investimentos
11. **orcamentos** - Orçamentos
12. **metas** - Metas financeiras
13. **conciliacoes** - Conciliações bancárias
14. **compartilhamentos_conta** - Compartilhamento de contas
15. **convites_compartilhamento** - Convites de compartilhamento
16. **logs_acesso** - Logs de acesso

---

## 🚀 PROCESSO COMPLETO DE SINCRONIZAÇÃO

### Passo a Passo:

```bash
# 1. Configurar para Supabase
copy .env.supabase .env

# 2. Alternar schema para PostgreSQL
npm run db:supabase

# 3. Verificar estado atual
node verificar-schema-supabase.js

# 4. Sincronizar schema
node sync-supabase-schema.js

# 5. Popular banco (se vazio)
npm run seed

# 6. Verificar novamente
node verificar-schema-supabase.js

# 7. Testar localmente com Supabase
npm run dev
```

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "Table does not exist"

**Causa:** Tabela não existe no Supabase  
**Solução:**
```bash
node sync-supabase-schema.js
```

### Erro: "Can't reach database server"

**Causa:** URL do Supabase incorreta ou inacessível  
**Solução:**
1. Verificar DATABASE_URL no .env
2. Verificar se Supabase está online
3. Verificar credenciais

### Erro: "Authentication failed"

**Causa:** Senha incorreta  
**Solução:**
1. Verificar senha no .env
2. Resetar senha no Supabase Dashboard

---

## 🔐 CONFIGURAÇÃO DO .ENV

### Para Supabase:

```env
DATABASE_URL="postgresql://postgres.xxxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"
```

### Como obter a URL do Supabase:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Settings → Database
4. Copie "Connection string" (URI)
5. Substitua `[YOUR-PASSWORD]` pela senha real

---

## 📝 SCRIPTS DISPONÍVEIS

### Verificação:
```bash
node verificar-schema-supabase.js    # Verificar estado do Supabase
node diagnostico-completo.js         # Diagnóstico completo local
```

### Sincronização:
```bash
node sync-supabase-schema.js         # Sincronizar schema
npm run seed                         # Popular banco
```

### Alternância:
```bash
npm run db:local                     # Usar SQLite local
npm run db:supabase                  # Usar PostgreSQL/Supabase
```

---

## ✅ VERIFICAÇÃO FINAL

Após sincronizar, execute:

```bash
node verificar-schema-supabase.js
```

**Resultado esperado:**
```
✅ Tabelas OK: 16
⚠️  Tabelas vazias: 0
❌ Tabelas com erro: 0

✅ TUDO OK! Banco Supabase está sincronizado e populado.
```

---

## 🌐 DEPLOY NA VERCEL

Após sincronizar o Supabase:

1. ✅ Commit e push para GitHub
2. ✅ Vercel detecta automaticamente
3. ✅ Configura variáveis de ambiente na Vercel:
   - `DATABASE_URL` (URL do Supabase)
   - `NEXTAUTH_URL` (URL da Vercel)
   - `NEXTAUTH_SECRET` (mesmo do .env)
4. ✅ Deploy automático!

---

## 🎯 RESUMO

**Para garantir que funciona na Vercel:**

1. ✅ Sincronizar schema: `node sync-supabase-schema.js`
2. ✅ Popular banco: `npm run seed`
3. ✅ Testar local com Supabase: `npm run dev`
4. ✅ Se funcionar local, funcionará na Vercel!

---

**Desenvolvido com ❤️ por Finanças UP**
