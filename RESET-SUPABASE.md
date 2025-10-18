# 🔄 RESET COMPLETO DO BANCO SUPABASE

## 📋 INFORMAÇÕES DO PROJETO

- **Project Name:** FinanceUP
- **Project ID:** lfzqihajyvmdwrjtefco
- **Dashboard:** https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco

---

## ⚠️ ATENÇÃO

Este processo irá **APAGAR TODOS OS DADOS** do banco Supabase e recriar tudo do zero!

---

## 🚀 OPÇÃO 1: RESET AUTOMÁTICO (Recomendado)

Execute o script automatizado:

```bash
node reset-supabase-completo.js
```

**O que faz:**
1. ✅ Configura schema para PostgreSQL
2. ✅ Gera Prisma Client
3. ✅ Reseta banco Supabase (apaga tudo)
4. ✅ Recria todas as 16 tabelas
5. ✅ Popula com dados de teste
6. ✅ Verifica resultado

---

## 🔧 OPÇÃO 2: RESET MANUAL

### Passo a Passo:

```bash
# 1. Configurar para Supabase
copy .env.supabase .env

# 2. Alternar schema
npm run db:supabase

# 3. Gerar Prisma Client
npx prisma generate

# 4. RESET COMPLETO (apaga tudo e recria)
npx prisma db push --force-reset --accept-data-loss

# 5. Popular banco
npm run seed

# 6. Verificar
node verificar-schema-supabase.js
```

---

## 🗑️ OPÇÃO 3: RESET PELO SUPABASE DASHBOARD

Se preferir fazer pelo Dashboard:

1. Acesse: https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco
2. Vá em **Database** → **Tables**
3. Delete todas as tabelas manualmente
4. Execute localmente:
   ```bash
   npx prisma db push
   npm run seed
   ```

---

## 📊 TABELAS QUE SERÃO RECRIADAS

### 16 Tabelas:

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

## 🧪 DADOS DE TESTE QUE SERÃO CRIADOS

### Usuário:
- **Email:** teste@financasup.com
- **Senha:** 123456

### Contas Bancárias:
- Conta Corrente: R$ 5.000,00
- Poupança: R$ 10.000,00
- Carteira: R$ 500,00

### Cartões de Crédito:
- Visa Gold (BB): Limite R$ 5.000
- Mastercard Platinum (Itaú): Limite R$ 3.000

### Outros:
- 8 Categorias
- 14 Transações de teste
- 1 Empréstimo com 10 parcelas
- 2 Investimentos
- 2 Orçamentos
- 2 Metas

---

## ✅ VERIFICAÇÃO APÓS RESET

Execute para verificar:

```bash
node verificar-schema-supabase.js
```

**Resultado esperado:**
```
✅ Tabelas OK: 11
⚠️  Tabelas vazias: 5 (normal, são opcionais)
❌ Tabelas com erro: 0
```

---

## 🚀 TESTAR APLICAÇÃO

Após o reset:

```bash
npm run dev
```

Acesse: http://localhost:3000

**Login:**
- Email: teste@financasup.com
- Senha: 123456

---

## 🌐 DEPLOY NA VERCEL

Após resetar e testar localmente:

1. ✅ Commit e push para GitHub
2. ✅ Vercel fará deploy automático
3. ✅ Configure as variáveis de ambiente na Vercel:
   - `DATABASE_URL` (mesma do .env.supabase)
   - `NEXTAUTH_URL` (URL da Vercel)
   - `NEXTAUTH_SECRET` (mesmo do .env)

---

## ⚠️ COMANDOS IMPORTANTES

### Reset Completo:
```bash
npx prisma db push --force-reset --accept-data-loss
```

### Apenas Sincronizar (sem apagar):
```bash
npx prisma db push
```

### Popular Banco:
```bash
npm run seed
```

### Verificar Estado:
```bash
node verificar-schema-supabase.js
```

---

## 🔐 SEGURANÇA

### Backup Antes do Reset:

Se quiser fazer backup dos dados atuais:

1. Acesse Supabase Dashboard
2. Database → Backups
3. Ou exporte via SQL:
   ```sql
   -- No Supabase SQL Editor
   SELECT * FROM usuarios;
   -- Copie os dados importantes
   ```

---

## 💡 DICAS

### Quando fazer reset?

✅ **SIM:**
- Mudanças grandes no schema
- Testes de desenvolvimento
- Banco com dados inconsistentes
- Antes de deploy importante

❌ **NÃO:**
- Banco com dados de produção
- Usuários reais cadastrados
- Sem backup dos dados importantes

---

## 🎯 RESUMO RÁPIDO

**Para reset completo:**
```bash
node reset-supabase-completo.js
```

**Para testar:**
```bash
npm run dev
```

**Login:**
- teste@financasup.com / 123456

---

**Desenvolvido com ❤️ por Finanças UP**
