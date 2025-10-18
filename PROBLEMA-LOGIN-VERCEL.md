# 🔧 DIAGNÓSTICO: PROBLEMA DE LOGIN NO VERCEL

## 🎯 PROBLEMA IDENTIFICADO

Você mencionou que "fez algumas alterações em segurança do sistema" e agora não consegue logar no Vercel + Supabase.

---

## 🔍 CAUSAS PROVÁVEIS

### 1. **NEXTAUTH_SECRET Diferente entre Local e Vercel**

**Sintoma:** Login funciona local, mas não no Vercel

**Causa:** O `NEXTAUTH_SECRET` no Vercel está diferente do local. Quando você alterou segurança, pode ter gerado um novo secret localmente mas não atualizou no Vercel.

**Solução:**
```bash
# 1. Ver o secret atual local
cat .env | grep NEXTAUTH_SECRET

# 2. Copiar o valor
# 3. Ir no Vercel: Settings → Environment Variables
# 4. Editar NEXTAUTH_SECRET com o mesmo valor
# 5. Redeploy
```

---

### 2. **NEXTAUTH_URL Incorreto no Vercel**

**Sintoma:** Redirect loops ou erro de callback

**Causa:** `NEXTAUTH_URL` não aponta para a URL correta do Vercel

**Verificar:**
```env
# ❌ ERRADO
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL="https://financas-up.vercel.app/"  # Barra no final

# ✅ CORRETO
NEXTAUTH_URL="https://financas-up.vercel.app"
```

---

### 3. **Debug Mode Desativado Impedindo Logs**

**Sintoma:** Não consegue ver o que está acontecendo

**Causa:** Você desativou `debug: true` no `auth.ts`

**Solução Temporária:**
```typescript
// src/lib/auth.ts linha 133
debug: true,  // Reativar temporariamente para ver logs
```

Depois de identificar o problema, voltar para:
```typescript
debug: process.env.NODE_ENV === 'development',
```

---

### 4. **Cookies com Configuração Incorreta**

**Sintoma:** Login não persiste, sempre pede login novamente

**Causa:** Configuração de cookies incompatível com produção

**Verificar em `src/lib/auth.ts`:**
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',  // ✅ Correto
      path: '/',
      secure: process.env.NODE_ENV === 'production',  // ✅ Correto
    }
  },
}
```

---

### 5. **DATABASE_URL com pgbouncer no Vercel**

**Sintoma:** Erro de conexão com banco

**Causa:** Vercel não funciona bem com `pgbouncer=true`

**Verificar:**
```env
# ❌ ERRADO no Vercel
DATABASE_URL="postgresql://...?pgbouncer=true"

# ✅ CORRETO no Vercel
DATABASE_URL="postgresql://...?pgbouncer=false"
# ou simplesmente sem o parâmetro
DATABASE_URL="postgresql://..."
```

---

### 6. **Senha do Banco Alterada no Supabase**

**Sintoma:** Erro "authentication failed"

**Causa:** Você rotacionou a senha no Supabase mas não atualizou no Vercel

**Solução:**
1. Ir no Supabase: Settings → Database → Connection String
2. Copiar a nova URL com a senha correta
3. Atualizar no Vercel: Settings → Environment Variables → DATABASE_URL
4. Redeploy

---

## 🔧 PASSO A PASSO PARA RESOLVER

### Etapa 1: Verificar Variáveis no Vercel

1. Acesse: https://vercel.com/seu-usuario/financas-up/settings/environment-variables
2. Verifique se existem:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
3. Clique em "Edit" para ver os valores (parcialmente)

### Etapa 2: Comparar com Local

```bash
# Ver variáveis locais
cat .env

# Comparar:
# - NEXTAUTH_SECRET deve ser IGUAL
# - NEXTAUTH_URL deve ser https://seu-app.vercel.app
# - DATABASE_URL deve apontar para Supabase
```

### Etapa 3: Corrigir Variáveis

Se encontrar diferenças:

1. **NEXTAUTH_SECRET:**
```bash
# Copiar do .env local
cat .env | grep NEXTAUTH_SECRET
# Colar no Vercel (Edit → Save)
```

2. **NEXTAUTH_URL:**
```env
# No Vercel deve ser:
NEXTAUTH_URL="https://financas-up.vercel.app"
```

3. **DATABASE_URL:**
```env
# Sem pgbouncer
DATABASE_URL="postgresql://postgres.xxx:senha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

### Etapa 4: Redeploy

1. Vá em: Deployments
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"
4. Aguarde 1-2 minutos

### Etapa 5: Testar

1. Abra uma aba anônima
2. Acesse: https://financas-up.vercel.app/login
3. Tente fazer login
4. Se não funcionar, vá para Etapa 6

### Etapa 6: Ver Logs

1. Vá em: Deployments → Último deploy
2. Clique em "Functions"
3. Procure por erros nos logs
4. Copie e me envie os erros

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### Erro: "Invalid credentials"

**Causa:** Senha do usuário pode ter sido alterada

**Solução:**
```sql
-- No Supabase SQL Editor
-- Resetar senha para "123456"
UPDATE usuarios 
SET senha = '$2a$10$rOZJQqVJ5qYxK.fJvnKOHO8YvJKqYqVJ5qYxK.fJvnKOHO8YvJKqY'
WHERE email = 'seu-email@gmail.com';
```

### Erro: "CSRF token mismatch"

**Causa:** Cookies não estão sendo salvos

**Solução:**
1. Limpar cookies do navegador
2. Tentar em aba anônima
3. Verificar se `secure: true` em produção

### Erro: "Can't reach database"

**Causa:** DATABASE_URL incorreto

**Solução:**
1. Pegar nova connection string no Supabase
2. Atualizar no Vercel
3. Redeploy

### Erro: "Callback URL mismatch"

**Causa:** NEXTAUTH_URL incorreto

**Solução:**
```env
# Deve ser exatamente:
NEXTAUTH_URL="https://financas-up.vercel.app"
# Sem barra no final
# Com https://
```

---

## 🔍 COMO DEBUGAR

### Método 1: Ativar Debug Temporariamente

```typescript
// src/lib/auth.ts linha 133
debug: true,  // Forçar debug em produção
```

Commit, push e veja os logs no Vercel.

### Método 2: Usar Rota de Debug

```typescript
// src/app/api/debug-login/route.ts
// Já existe no projeto
// POST https://financas-up.vercel.app/api/debug-login
// Body: { "email": "seu@email.com", "senha": "123456" }
```

Isso vai te dizer exatamente onde está o problema.

### Método 3: Verificar Logs do Vercel

1. Deployments → Último deploy
2. Functions → Clique em qualquer função
3. Real-time Logs → Veja os erros

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] NEXTAUTH_SECRET igual no local e Vercel
- [ ] NEXTAUTH_URL = https://financas-up.vercel.app
- [ ] DATABASE_URL sem pgbouncer
- [ ] Senha do banco está correta
- [ ] Cookies configurados corretamente
- [ ] Fez redeploy após alterar variáveis
- [ ] Testou em aba anônima
- [ ] Verificou logs do Vercel

---

## 🆘 SE NADA FUNCIONAR

### Opção 1: Resetar Tudo

```bash
# 1. Gerar novo NEXTAUTH_SECRET
openssl rand -base64 32

# 2. Atualizar local
echo "NEXTAUTH_SECRET=novo-secret-aqui" >> .env

# 3. Atualizar Vercel
# Settings → Environment Variables → Edit NEXTAUTH_SECRET

# 4. Resetar senha do usuário no Supabase
# SQL Editor:
UPDATE usuarios SET senha = '$2a$10$...' WHERE email = 'seu@email.com';

# 5. Redeploy
```

### Opção 2: Testar Local com Supabase

```bash
# Copiar .env.supabase para .env
cp .env.supabase .env

# Rodar local
npm run dev

# Se funcionar local, o problema é no Vercel
# Se não funcionar, o problema é no banco/credenciais
```

### Opção 3: Me Enviar Informações

Me envie:
1. Print das variáveis do Vercel (sem mostrar valores completos)
2. Logs do último deploy (Functions → Real-time Logs)
3. Erro exato que aparece no navegador (F12 → Console)
4. Resultado de: POST https://financas-up.vercel.app/api/debug-login

---

## 📝 RESUMO

**Problema mais provável:**
- NEXTAUTH_SECRET diferente entre local e Vercel

**Solução rápida:**
1. Copiar NEXTAUTH_SECRET do .env local
2. Colar no Vercel (Environment Variables)
3. Redeploy
4. Testar

**Se não resolver:**
- Verificar NEXTAUTH_URL
- Verificar DATABASE_URL (sem pgbouncer)
- Ver logs do Vercel
- Usar rota de debug

---

**Criado em:** 18/10/2025  
**Status:** Aguardando feedback do usuário
