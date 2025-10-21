# Correção: Erro DATABASE_URL no Netlify

## 🐛 Problema Identificado

### Erro no Build
```
PrismaClientConstructorValidationError: Invalid value undefined for datasource "db" 
provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }
```

### Causa Raiz
O Netlify estava usando variáveis de ambiente com nomes diferentes:
- `SUPABASE_DATABASE_URL` (configurado pelo plugin do Supabase)
- `NEXT_PUBLIC_SUPABASE_DATABASE_URL`

Mas a aplicação esperava:
- `DATABASE_URL`

---

## ✅ Soluções Aplicadas

### 1. Atualizado `src/lib/prisma.ts`
Adicionada função para buscar DATABASE_URL de múltiplas fontes:

```typescript
const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
    'file:./dev.db' // Fallback para desenvolvimento
  );
};
```

### 2. Criado `next.config.mjs`
Mapeamento de variáveis de ambiente:

```javascript
env: {
  DATABASE_URL: process.env.DATABASE_URL || 
                process.env.SUPABASE_DATABASE_URL || 
                process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 
                process.env.NEXT_PUBLIC_NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}
```

### 3. Criado `scripts/configure-prisma-netlify.js`
Script específico para configurar Prisma no Netlify:
- Verifica se está no ambiente Netlify
- Garante que o schema está configurado para PostgreSQL
- Não interfere com desenvolvimento local

### 4. Atualizado `package.json`
```json
{
  "build": "node scripts/configure-prisma-netlify.js && prisma generate && next build",
  "build:local": "node scripts/configure-prisma.js && prisma generate && next build"
}
```

### 5. Atualizado `netlify.toml`
```toml
[build]
  command = "npm run build"  # Usa o script correto
```

---

## 🔍 Variáveis de Ambiente no Netlify

### Configuradas Automaticamente pelo Plugin Supabase
```
✅ SUPABASE_DATABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_JWT_SECRET
✅ NEXT_PUBLIC_SUPABASE_DATABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Configuradas Manualmente no netlify.toml
```
✅ DATABASE_URL (para compatibilidade)
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ NETLIFY
✅ NODE_VERSION
```

---

## 🧪 Como Testar

### Teste Local
```bash
# Simular ambiente Netlify
export NETLIFY=true
export SUPABASE_DATABASE_URL="postgresql://..."
npm run build
```

### Verificar Variáveis
```bash
# No Netlify, verificar logs do build
# Deve mostrar:
# ✅ Schema configurado para PostgreSQL
# 📝 DATABASE_URL: Configurada
# 📝 SUPABASE_DATABASE_URL: Configurada
```

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [x] `src/lib/prisma.ts` atualizado
- [x] `next.config.mjs` criado
- [x] `scripts/configure-prisma-netlify.js` criado
- [x] `package.json` atualizado
- [x] `netlify.toml` atualizado

### Após o Deploy
- [ ] Verificar logs do build
- [ ] Confirmar que DATABASE_URL foi encontrada
- [ ] Testar login na aplicação
- [ ] Verificar se dados do Supabase aparecem

---

## 🚀 Próximo Deploy

### Fazer Push
```bash
git add .
git commit -m "fix: corrigir DATABASE_URL para Netlify"
git push origin fix/deploy-issues
```

### Monitorar Build
1. Acessar: https://app.netlify.com/sites/financas-up/deploys
2. Verificar logs em tempo real
3. Procurar por:
   - ✅ "Schema configurado para PostgreSQL"
   - ✅ "Generated Prisma Client"
   - ✅ "Compiled successfully"

---

## 🐛 Troubleshooting

### Se ainda der erro de DATABASE_URL

#### Opção 1: Adicionar Variável Manualmente
1. Acessar: https://app.netlify.com/sites/financas-up/settings/deploys
2. Environment variables
3. Adicionar:
   ```
   DATABASE_URL = postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
   ```

#### Opção 2: Verificar Plugin Supabase
```bash
# Verificar se o plugin está instalado
netlify plugins:list

# Se não estiver, instalar
netlify plugins:install @netlify/plugin-supabase
```

#### Opção 3: Usar Variável do Plugin
Se o plugin do Supabase estiver configurado, a variável `SUPABASE_DATABASE_URL` deve estar disponível automaticamente.

---

## 📊 Comparação: Antes vs Depois

### ANTES ❌
```typescript
// src/lib/prisma.ts
datasources: {
  db: {
    url: process.env.DATABASE_URL, // undefined no Netlify
  },
}
```

### DEPOIS ✅
```typescript
// src/lib/prisma.ts
const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||  // ✅ Netlify
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||  // ✅ Netlify
    'file:./dev.db'  // ✅ Fallback local
  );
};

datasources: {
  db: {
    url: getDatabaseUrl(), // ✅ Sempre encontra a URL
  },
}
```

---

## ✅ Conclusão

As correções garantem que a aplicação funcione em múltiplos ambientes:
- ✅ **Netlify:** Usa `SUPABASE_DATABASE_URL` do plugin
- ✅ **Vercel:** Usa `DATABASE_URL` configurada manualmente
- ✅ **Local:** Usa `DATABASE_URL` do `.env` ou fallback para SQLite

O build deve funcionar agora! 🎉
