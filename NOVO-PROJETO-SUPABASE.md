# 🆕 CONFIGURAÇÃO NOVO PROJETO SUPABASE

## 📋 INFORMAÇÕES QUE VOCÊ PRECISA ME FORNECER

Após criar o novo projeto no Supabase, me forneça:

### 1. **Project Reference ID**
Exemplo: `lfzqihajyvmdwrjtefco`
- Onde encontrar: Dashboard → Settings → General → Reference ID

### 2. **Database Password**
A senha que você definiu ao criar o projeto
- Exemplo: `Alpha124578S1nfo`

### 3. **Connection String**
- Onde encontrar: Dashboard → Settings → Database → Connection string
- Copie a **Session pooler** (porta 5432)
- Exemplo: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

### 4. **Region**
Exemplo: `aws-1-us-east-1` ou `aws-0-sa-east-1`
- Onde encontrar: Na própria Connection String

---

## 🚀 PASSO A PASSO COMPLETO

### PASSO 1: Criar Novo Projeto no Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **New Project**
3. Preencha:
   - **Name:** FinanceUP (ou outro nome)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha o mais próximo (São Paulo ou US East)
   - **Pricing Plan:** Free
4. Clique em **Create new project**
5. Aguarde 2-3 minutos (criação do projeto)

---

### PASSO 2: Copiar Informações

Após o projeto ser criado:

1. Vá em **Settings** → **General**
   - Copie o **Reference ID**

2. Vá em **Settings** → **Database**
   - Role até **Connection string**
   - Selecione **Session pooler**
   - Copie a string completa
   - Substitua `[YOUR-PASSWORD]` pela senha que você criou

---

### PASSO 3: Executar SQL no Supabase

1. No Dashboard, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo local:
   ```
   C:\Users\foxgt\CascadeProjects\financas-up\scripts\utils\banco-completo-corrigido.sql
   ```
4. Copie **TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. Cole no SQL Editor (Ctrl+V)
6. Clique em **RUN** (ou Ctrl+Enter)
7. Aguarde a execução (10-20 segundos)
8. Verifique se não há erros

---

### PASSO 4: Verificar Tabelas Criadas

1. Vá em **Table Editor**
2. Você deve ver **16 tabelas**:
   - ✅ usuarios
   - ✅ categorias
   - ✅ contas_bancarias
   - ✅ cartoes_credito
   - ✅ faturas
   - ✅ pagamentos_fatura
   - ✅ transacoes
   - ✅ emprestimos
   - ✅ parcelas_emprestimo
   - ✅ investimentos
   - ✅ orcamentos
   - ✅ metas
   - ✅ conciliacoes
   - ✅ compartilhamentos_conta
   - ✅ convites_compartilhamento
   - ✅ logs_acesso

---

### PASSO 5: Me Fornecer as Informações

**Cole aqui no chat:**

```
Project Reference ID: [COLE AQUI]
Database Password: [COLE AQUI]
Connection String: [COLE AQUI]
Region: [COLE AQUI]
```

**Exemplo:**
```
Project Reference ID: abc123xyz456
Database Password: MinhaSenh@123
Connection String: postgresql://postgres.abc123xyz456:MinhaSenh@123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
Region: aws-0-sa-east-1
```

---

## 🔧 O QUE EU VOU FAZER COM ESSAS INFORMAÇÕES

Quando você me fornecer as informações acima, eu vou:

1. ✅ Atualizar `.env`
2. ✅ Atualizar `.env.supabase`
3. ✅ Atualizar todos os backups
4. ✅ Gerar novo Prisma Client
5. ✅ Executar seed (popular banco)
6. ✅ Verificar se tudo está funcionando
7. ✅ Fazer commit das alterações

---

## 📝 ARQUIVOS QUE SERÃO ATUALIZADOS

```
.env
.env.supabase
bkp/.env.supabase.bkp
bkp/.env.backup.20251017_154937
```

---

## ✅ CHECKLIST

Antes de me fornecer as informações, verifique:

- [ ] Novo projeto Supabase criado
- [ ] Projeto está ativo (não pausado)
- [ ] SQL executado sem erros
- [ ] 16 tabelas visíveis no Table Editor
- [ ] Connection String copiada (Session pooler, porta 5432)
- [ ] Senha anotada

---

## 🎯 APÓS CONFIGURAÇÃO

Depois que eu atualizar tudo, você poderá:

```bash
# Popular banco com dados de teste
npm run seed

# Testar aplicação
npm run dev

# Login
Email: teste@financasup.com
Senha: 123456
```

---

## ⚠️ IMPORTANTE

**NÃO compartilhe:**
- Database Password em repositórios públicos
- Connection String completa em lugares públicos
- API Keys

**Mantenha seguro:**
- Arquivo `.env` (já está no .gitignore)
- Backups locais

---

## 💡 DICA

Se quiser testar antes de popular:

1. Após executar o SQL
2. Vá em **Table Editor**
3. Clique em `usuarios`
4. Clique em **Insert row**
5. Preencha manualmente um usuário de teste

Mas é mais fácil usar o seed! 😉

---

**Aguardando suas informações para configurar tudo! 🚀**
