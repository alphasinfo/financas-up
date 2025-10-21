# Erro de Login no Netlify

## 🐛 Problema Atual

**Sintoma:** Ao tentar fazer login, redireciona para `/api/auth/error` (404)

**Erros no Console:**
```
Failed to load resource: the server responded with a status of 404 ()
api/auth/check-rate-limit:1

SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## 🔍 Análise

### 1. Rate Limit Funciona
- ✅ Arquivo existe: `src/app/api/auth/check-rate-limit/route.ts`
- ✅ Dependência existe: `src/lib/rate-limit-login.ts`
- ✅ Código revertido

### 2. Problema Real: NextAuth Error
O redirecionamento para `/api/auth/error` indica que o NextAuth está falhando.

**Possíveis causas:**
1. ❌ DATABASE_URL não está sendo lida corretamente
2. ❌ Prisma Client não consegue conectar ao Supabase
3. ❌ Erro na autenticação de credenciais

## 🔧 Diagnóstico

### Verificar Variáveis de Ambiente no Netlify

As variáveis estão configuradas:
```
✅ DATABASE_URL
✅ SUPABASE_DATABASE_URL
✅ NEXT_PUBLIC_SUPABASE_DATABASE_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
```

### Problema Provável: Prisma no Netlify

O Netlify usa **serverless functions** e o Prisma pode ter problemas com:
1. Binary do Prisma não incluído no build
2. Conexões não sendo gerenciadas corretamente
3. DATABASE_URL não sendo lida em runtime

## ✅ Soluções

### Solução 1: Adicionar Binary do Prisma (RECOMENDADO)

Atualizar `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Atualizar `netlify.toml`:
```toml
[build]
  command = "prisma generate && npm run build"
```

### Solução 2: Configurar Prisma para Serverless

Atualizar `src/lib/prisma.ts`:
```typescript
// Adicionar configuração para Netlify
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Configurações para serverless
  log: ['error'],
  errorFormat: 'minimal',
});
```

### Solução 3: Verificar next.config.mjs

Garantir que as variáveis estão sendo passadas:
```javascript
env: {
  DATABASE_URL: process.env.DATABASE_URL || 
                process.env.SUPABASE_DATABASE_URL || 
                process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
}
```

### Solução 4: Adicionar Logs de Debug

Adicionar em `src/lib/auth.ts`:
```typescript
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('🔍 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
```

## 🚀 Plano de Ação

### Passo 1: Verificar Logs do Netlify
Acessar: https://app.netlify.com/sites/financas-up/functions

Procurar por:
- Erros de Prisma
- Erros de DATABASE_URL
- Erros de conexão

### Passo 2: Adicionar Logs de Debug
Temporariamente adicionar logs para entender o erro.

### Passo 3: Testar Localmente com Variáveis do Netlify
```bash
$env:DATABASE_URL="postgresql://..."
$env:NETLIFY="true"
npm run build
npm start
```

### Passo 4: Verificar se Prisma Generate Está Rodando
No build do Netlify, deve aparecer:
```
✔ Generated Prisma Client
```

## 📋 Checklist de Verificação

- [ ] Prisma Client está sendo gerado no build
- [ ] DATABASE_URL está disponível em runtime
- [ ] NextAuth consegue acessar o Prisma
- [ ] Logs do Netlify Functions mostram o erro real
- [ ] Teste local com variáveis do Netlify funciona

## 💡 Solução Rápida (Temporária)

Se nada funcionar, podemos:
1. Desabilitar autenticação temporariamente
2. Usar autenticação apenas com Google (OAuth)
3. Usar um banco SQLite temporário no Netlify

## 🔗 Links Úteis

- **Netlify Functions:** https://app.netlify.com/sites/financas-up/functions
- **Netlify Logs:** https://app.netlify.com/sites/financas-up/deploys
- **Prisma + Netlify:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-netlify

---

**Próximo Passo:** Verificar logs do Netlify Functions para ver o erro real.
