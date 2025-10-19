# 🔧 CORRIGIR ERRO JSON NO VERCEL

## 🎯 Erro Atual

```
SyntaxError: Unexpected token 'e', "email=fox."... is not valid JSON
at /api/auth/callback/credentials
```

---

## 🔍 CAUSA DO PROBLEMA

O NextAuth 4.24.10 tem um bug conhecido no Vercel onde ele tenta fazer parse de `form-urlencoded` como JSON no callback.

---

## ✅ SOLUÇÃO: Adicionar Variável no Vercel

### Passo 1: Adicionar NEXTAUTH_URL_INTERNAL

1. Acesse: https://vercel.com/seu-usuario/financas-up/settings/environment-variables
2. Clique em **Add New**
3. Adicione:

```
Name: NEXTAUTH_URL_INTERNAL
Value: https://financas-up.vercel.app
Environment: Production
```

4. Clique em **Save**

### Passo 2: Redeploy

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Aguarde 2 minutos

---

## 📋 VARIÁVEIS COMPLETAS NO VERCEL

Você deve ter estas 4 variáveis:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_URL` | `https://financas-up.vercel.app` |
| `NEXTAUTH_URL_INTERNAL` | `https://financas-up.vercel.app` |
| `NEXTAUTH_SECRET` | `8Sg4me2Px3VBzR6eeyK+Kjm7sVzdrawgQgK1lKi0Rz4=` |

---

## 🔄 ALTERNATIVA: Atualizar NextAuth

Se adicionar a variável não resolver, precisamos atualizar o NextAuth:

```bash
npm install next-auth@latest
npm test
git add package.json package-lock.json
git commit -m "fix: Update next-auth to fix Vercel JSON parse error"
git push
```

**Atenção:** Isso pode quebrar compatibilidade. Teste localmente primeiro.

---

## 🧪 TESTAR APÓS CORREÇÃO

1. Abra aba anônima
2. Acesse: https://financas-up.vercel.app/login
3. Login:
   - Email: `fox.gts@gmail.com`
   - Senha: `123456`
4. Deve funcionar! ✅

---

## 📊 SE AINDA NÃO FUNCIONAR

### Opção 1: Ver Logs Detalhados

1. Vercel → Deployments → Último deploy
2. Functions → Clique em qualquer função
3. Real-time Logs
4. Copie o erro completo e me envie

### Opção 2: Testar Local com Produção

```bash
# Usar variáveis de produção localmente
cp .env.supabase .env
echo "NODE_ENV=production" >> .env

npm run build
npm start

# Testar em http://localhost:3000
```

Se funcionar local mas não no Vercel, é problema de configuração do Vercel.

---

## 🔍 DEBUG ADICIONAL

Se quiser ver exatamente o que está acontecendo, ative debug temporariamente:

1. No Vercel, adicione variável:
   ```
   Name: NEXTAUTH_DEBUG
   Value: true
   ```

2. Redeploy

3. Tente fazer login

4. Veja logs detalhados em: Deployments → Functions

5. **IMPORTANTE:** Remova `NEXTAUTH_DEBUG` depois de debugar!

---

## ✅ CHECKLIST

- [ ] Adicionei `NEXTAUTH_URL_INTERNAL` no Vercel
- [ ] Fiz Redeploy
- [ ] Aguardei 2 minutos
- [ ] Testei em aba anônima
- [ ] Funcionou! 🎉

---

**Criado em:** 18/10/2025  
**Status:** Aguardando teste após adicionar variável
