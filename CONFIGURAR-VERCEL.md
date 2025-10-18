# 🚀 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## ✅ DIAGNÓSTICO CONFIRMADO

O teste mostrou que:
- ✅ Banco de dados: **OK**
- ✅ Usuário existe: **OK**
- ✅ Senha válida: **OK**
- ❌ NextAuth: **Problema de configuração**

---

## 🔧 SOLUÇÃO: CONFIGURAR VARIÁVEIS NO VERCEL

### Passo 1: Acessar Configurações do Vercel

1. Acesse: https://vercel.com/seu-usuario/financas-up
2. Clique em **Settings** (Configurações)
3. Clique em **Environment Variables** (Variáveis de Ambiente)

### Passo 2: Adicionar/Verificar Variáveis

Você precisa ter **EXATAMENTE** estas variáveis:

#### 1. DATABASE_URL
```
postgresql://postgres.xxxxx:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```
- ✅ Deve ser a mesma URL do seu `.env` local
- ✅ Deve apontar para o Supabase
- ⚠️ **NÃO use `pgbouncer=true` no Vercel**

#### 2. NEXTAUTH_URL
```
https://financas-up.vercel.app
```
- ✅ Deve ser a URL completa do seu app
- ❌ **NÃO** use `http://localhost:3000`
- ⚠️ Sem barra no final

#### 3. NEXTAUTH_SECRET
```
[sua-chave-secreta-aqui]
```
- ✅ Deve ser a mesma do seu `.env` local
- ✅ Gere com: `openssl rand -base64 32`
- ⚠️ Deve ter pelo menos 32 caracteres

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### No Vercel:

- [ ] `DATABASE_URL` está configurado
- [ ] `DATABASE_URL` aponta para o Supabase correto
- [ ] `NEXTAUTH_URL` é `https://financas-up.vercel.app`
- [ ] `NEXTAUTH_SECRET` está configurado
- [ ] Todas as variáveis estão em **Production**
- [ ] Fez **Redeploy** após adicionar variáveis

### Como Fazer Redeploy:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Aguarde 1-2 minutos

---

## 🎯 CONFIGURAÇÃO COMPLETA

### Variáveis Obrigatórias:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | URL do Supabase | Production |
| `NEXTAUTH_URL` | https://financas-up.vercel.app | Production |
| `NEXTAUTH_SECRET` | Chave secreta (32+ chars) | Production |

### Variáveis Opcionais:

| Variável | Valor | Para que serve |
|----------|-------|----------------|
| `OPENAI_API_KEY` | Chave da OpenAI | Funcionalidades de IA |
| `RESEND_API_KEY` | Chave do Resend | Envio de emails |
| `RESEND_FROM_EMAIL` | Email remetente | Envio de emails |
| `SENTRY_DSN` | DSN do Sentry | Monitoramento de erros |

---

## 🔍 COMO VERIFICAR SE ESTÁ CORRETO

### Método 1: Verificar Variáveis

1. Vá em **Settings → Environment Variables**
2. Verifique se todas estão lá
3. Clique em **Edit** para ver os valores (parcialmente)

### Método 2: Testar Login

Após configurar e fazer redeploy:

1. Acesse: https://financas-up.vercel.app/login
2. Use: `fox.gts@gmail.com` / `123456`
3. Deve funcionar! ✅

### Método 3: Ver Logs

1. Vá em **Deployments**
2. Clique no último deploy
3. Clique em **Functions**
4. Veja os logs de execução

---

## ⚠️ PROBLEMAS COMUNS

### Problema 1: "Erro ao fazer login"
**Causa:** `NEXTAUTH_SECRET` diferente ou ausente  
**Solução:** Adicionar a mesma secret do `.env` local

### Problema 2: "Can't reach database"
**Causa:** `DATABASE_URL` incorreto  
**Solução:** Verificar URL do Supabase

### Problema 3: "Callback URL mismatch"
**Causa:** `NEXTAUTH_URL` incorreto  
**Solução:** Usar `https://financas-up.vercel.app`

### Problema 4: Variáveis não aplicadas
**Causa:** Não fez redeploy  
**Solução:** Fazer redeploy após adicionar variáveis

---

## 🎯 PASSO A PASSO COMPLETO

### 1. Gerar NEXTAUTH_SECRET (se não tiver)

No seu computador, rode:
```bash
openssl rand -base64 32
```

Copie o resultado (exemplo):
```
dGhpc2lzYXNlY3JldGtleWZvcm5leHRhdXRoMTIzNDU2Nzg5MA==
```

### 2. Pegar DATABASE_URL do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → Database
4. Copie "Connection string" (URI)
5. Substitua `[YOUR-PASSWORD]` pela senha

Exemplo:
```
postgresql://postgres.xxxxx:SuaSenha123@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

### 3. Adicionar no Vercel

1. Acesse: https://vercel.com/seu-usuario/financas-up/settings/environment-variables
2. Clique em **Add New**
3. Adicione cada variável:

**DATABASE_URL:**
- Name: `DATABASE_URL`
- Value: `postgresql://postgres.xxxxx:...`
- Environment: ✅ Production

**NEXTAUTH_URL:**
- Name: `NEXTAUTH_URL`
- Value: `https://financas-up.vercel.app`
- Environment: ✅ Production

**NEXTAUTH_SECRET:**
- Name: `NEXTAUTH_SECRET`
- Value: `dGhpc2lzYXNlY3JldGtleWZvcm5leHRhdXRoMTIzNDU2Nzg5MA==`
- Environment: ✅ Production

4. Clique em **Save**

### 4. Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos 3 pontinhos (⋯) do último deploy
3. Clique em **Redeploy**
4. Aguarde 1-2 minutos

### 5. Testar

1. Acesse: https://financas-up.vercel.app/login
2. Email: `fox.gts@gmail.com`
3. Senha: `123456`
4. Clique em **Entrar**
5. ✅ Deve funcionar!

---

## 📞 PRECISA DE AJUDA?

Se ainda não funcionar após seguir todos os passos:

1. Tire um print das variáveis de ambiente (sem mostrar os valores completos)
2. Copie os logs do deploy
3. Me envie para eu analisar

---

## ✅ CHECKLIST FINAL

Antes de testar, confirme:

- [ ] `DATABASE_URL` adicionado no Vercel
- [ ] `NEXTAUTH_URL` = `https://financas-up.vercel.app`
- [ ] `NEXTAUTH_SECRET` adicionado (32+ caracteres)
- [ ] Todas em **Production** environment
- [ ] Fez **Redeploy** após adicionar
- [ ] Aguardou deploy completar (1-2 min)
- [ ] Testou em aba anônima/privada

Se todos os itens estiverem ✅, o login **DEVE** funcionar!

---

**Última atualização:** 18/10/2025  
**Status:** Aguardando configuração no Vercel
