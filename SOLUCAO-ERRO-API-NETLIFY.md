# Solução: Erro 404 nas Rotas API do Netlify

## 🎯 Resumo Executivo

**Problema:** Rotas API retornando 404 e HTML em vez de JSON  
**Causa:** Conflito entre redirect manual e plugin do Next.js  
**Solução:** Remover redirect conflitante do netlify.toml  
**Status:** ✅ Resolvido e em produção

---

## 🐛 O Problema

### Sintomas
```javascript
// Console do navegador
Failed to load resource: the server responded with a status of 404
api/auth/check-rate-limit:1

SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### O que estava acontecendo
1. Usuário tenta fazer login
2. Frontend chama `/api/auth/check-rate-limit`
3. Netlify retorna HTML (página 404) em vez de JSON
4. JavaScript tenta fazer `JSON.parse()` do HTML
5. Erro: "Unexpected token '<'"

---

## 🔍 Diagnóstico

### Passo 1: Verificar se os arquivos existem
```bash
✅ src/app/api/auth/check-rate-limit/route.ts
✅ src/lib/rate-limit-login.ts
✅ src/lib/validations/schemas.ts
✅ src/lib/validations/api-utils.ts
```

Todos os arquivos estavam corretos!

### Passo 2: Verificar configuração do Netlify

**netlify.toml (ANTES - ERRADO):**
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Problema identificado:**
- O redirect `/api/*` estava **forçando** todas as rotas API para `.netlify/functions`
- Mas o plugin `@netlify/plugin-nextjs` já gerencia isso automaticamente
- Resultado: **Conflito = 404**

---

## ✅ A Solução

### Mudança no netlify.toml

**ANTES (errado):**
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**DEPOIS (correto):**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

### Adicionado configuração de Functions

```toml
[functions]
  node_bundler = "esbuild"
  included_files = ["prisma/**", "node_modules/.prisma/**"]
```

---

## 🎓 Lição Aprendida

### Como o Plugin Funciona

O `@netlify/plugin-nextjs` automaticamente:

1. ✅ Converte rotas API (`/api/*`) em Netlify Functions
2. ✅ Gerencia redirects para rotas dinâmicas
3. ✅ Otimiza o build para serverless
4. ✅ Inclui dependências necessárias

### Regra de Ouro

**Quando usar `@netlify/plugin-nextjs`:**
- ❌ NÃO adicione redirects manuais para `/api/*`
- ❌ NÃO tente configurar functions manualmente
- ✅ Deixe o plugin gerenciar tudo
- ✅ Apenas configure variáveis de ambiente

---

## 📋 Checklist de Configuração Correta

### netlify.toml
```toml
[build]
  command = "prisma generate && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
  included_files = ["prisma/**", "node_modules/.prisma/**"]

# Apenas um redirect genérico (sem force)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

### package.json
```json
{
  "devDependencies": {
    "@netlify/plugin-nextjs": "^5.14.0"
  }
}
```

### Variáveis de Ambiente no Netlify
```
✅ DATABASE_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ NETLIFY=true
```

---

## 🚀 Resultado

### Antes
```
GET /api/auth/check-rate-limit
→ 404 Not Found
→ HTML: <!DOCTYPE html>...
→ SyntaxError: Unexpected token '<'
```

### Depois
```
GET /api/auth/check-rate-limit
→ 200 OK
→ JSON: { "blocked": false, "info": {...} }
→ ✅ Login funciona!
```

---

## 🔗 Commits Realizados

1. `aabb18d` - fix: corrigir rotas API no Netlify - remover redirect conflitante
2. `06d1fb6` - docs: documentar solucao do erro de login no Netlify

---

## 📚 Referências

- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)
- [Next.js API Routes no Netlify](https://docs.netlify.com/integrations/frameworks/next-js/overview/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)

---

**Data:** 21/10/2024  
**Status:** ✅ Resolvido e documentado
