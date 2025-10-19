# 🚀 DEPLOY E PRODUÇÃO - FINANÇAS UP

---

## 🎯 VISÃO GERAL

### Stack de Produção

- **Hospedagem:** Vercel
- **Banco de Dados:** Supabase (PostgreSQL)
- **CDN:** Vercel Edge Network
- **Monitoramento:** Sentry + Vercel Analytics
- **CI/CD:** GitHub Actions + Vercel

### URLs

- **Produção:** https://financas-up.vercel.app
- **Preview:** https://financas-up-[branch].vercel.app
- **Repositório:** https://github.com/alphasinfo/financas-up

---

## 📋 PRÉ-REQUISITOS

### Contas Necessárias

1. **GitHub** - Repositório do código
2. **Vercel** - Deploy e hospedagem
3. **Supabase** - Banco de dados PostgreSQL

### Variáveis de Ambiente

```env
# Produção
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="secret-producao"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"

# Opcional
SENTRY_DSN="https://..."
SMTP_HOST="smtp.gmail.com"
SMTP_USER="email@gmail.com"
SMTP_PASS="senha-app"
```

---

## 🚀 DEPLOY NO VERCEL

### Primeira Vez

#### 1. Conectar GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione repositório `financas-up`
5. Clique em **"Import"**

#### 2. Configurar Projeto

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 3. Adicionar Variáveis

1. Em **"Environment Variables"**
2. Adicione todas as variáveis do `.env`
3. Marque **"Production"**, **"Preview"**, **"Development"**

#### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde ~2-3 minutos
3. Deploy concluído! 🎉

### Deploys Subsequentes

**Automático:**
- Push para `main` → Deploy em produção
- Push para outras branches → Deploy de preview

**Manual:**
```bash
# Via CLI
npm i -g vercel
vercel --prod
```

---

## 🗄️ CONFIGURAR SUPABASE

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** financas-up
   - **Database Password:** (anote!)
   - **Region:** South America (São Paulo)
4. Aguarde ~2 minutos

### 2. Obter URL

1. **Settings** → **Database**
2. Em **"Connection string"**, copie **URI**
3. Substitua `[YOUR-PASSWORD]`

```
postgresql://postgres:SuaSenha@db.xxx.supabase.co:5432/postgres
```

### 3. Aplicar Schema

```bash
# Local
DATABASE_URL="postgresql://..." npx prisma db push

# Ou via Supabase SQL Editor
# Copiar e executar schema.prisma convertido
```

### 4. Configurar Backups

1. **Settings** → **Database**
2. **Backups** → Ativar backups diários
3. Retenção: 7 dias (Free) / 30 dias (Pro)

---

## 🔐 CONFIGURAR VARIÁVEIS NO VERCEL

### Via Dashboard

1. Projeto → **Settings** → **Environment Variables**
2. Adicionar cada variável:
   - **Name:** DATABASE_URL
   - **Value:** postgresql://...
   - **Environments:** Production, Preview, Development
3. Clicar em **"Save"**

### Via CLI

```bash
vercel env add DATABASE_URL production
# Cole o valor quando solicitado
```

### Variáveis Essenciais

```bash
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL
```

### Variáveis Opcionais

```bash
SENTRY_DSN
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

---

## 🔄 CI/CD

### GitHub Actions

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
```

### Vercel Deploy

**Automático:**
- Commit em `main` → Deploy produção
- PR aberto → Deploy preview
- Commit em PR → Atualiza preview

**Status:**
- ✅ Build passou
- ❌ Build falhou
- 🟡 Build em andamento

---

## 📊 MONITORAMENTO

### Vercel Analytics

**Ativar:**
1. Projeto → **Analytics**
2. Clicar em **"Enable"**

**Métricas:**
- Pageviews
- Unique visitors
- Top pages
- Referrers

### Vercel Speed Insights

**Ativar:**
1. Projeto → **Speed Insights**
2. Clicar em **"Enable"**

**Métricas:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

### Sentry

**Configurar:**

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Monitorar:**
- Erros JavaScript
- Erros de API
- Performance
- User feedback

---

## 🔍 LOGS

### Vercel Logs

```bash
# Via CLI
vercel logs

# Últimos 100 logs
vercel logs --limit 100

# Seguir logs em tempo real
vercel logs --follow
```

### Via Dashboard

1. Projeto → **Deployments**
2. Clicar no deployment
3. **"View Function Logs"**

---

## 🌐 DOMÍNIO PERSONALIZADO

### Adicionar Domínio

1. Projeto → **Settings** → **Domains**
2. Clicar em **"Add"**
3. Digite domínio (ex: `financas-up.com`)
4. Clicar em **"Add"**

### Configurar DNS

**Opção A: Nameservers Vercel**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Opção B: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Opção C: CNAME**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/HTTPS

- **Automático:** Vercel provisiona SSL automaticamente
- **Tempo:** ~1-2 minutos após DNS propagar
- **Renovação:** Automática

---

## 🔄 ROLLBACK

### Via Dashboard

1. **Deployments** → Selecionar deployment anterior
2. Clicar em **"..."** → **"Promote to Production"**

### Via CLI

```bash
vercel rollback
```

---

## 📈 PERFORMANCE

### Otimizações Aplicadas

- ✅ SSR (Server-Side Rendering)
- ✅ ISR (Incremental Static Regeneration)
- ✅ Image Optimization (Next/Image)
- ✅ Font Optimization (Next/Font)
- ✅ Code Splitting
- ✅ Minificação
- ✅ Compression (Gzip/Brotli)
- ✅ CDN (Edge Network)

### Métricas Alvo

- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **TTFB:** < 600ms

---

## 🛡️ SEGURANÇA

### Headers de Segurança

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

### Rate Limiting

```typescript
// Implementado em APIs críticas
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições
});
```

---

## 🔧 TROUBLESHOOTING

### Build Falha

**Erro:** TypeScript errors

**Solução:**
```bash
npm run lint
npx tsc --noEmit
```

### Erro de Conexão com Banco

**Erro:** Can't reach database

**Solução:**
- Verificar DATABASE_URL no Vercel
- Verificar se Supabase está ativo
- Testar conexão localmente

### Deploy Lento

**Causa:** Build pesado

**Solução:**
- Verificar dependências desnecessárias
- Otimizar imports
- Usar dynamic imports

---

## ✅ CHECKLIST DE DEPLOY

Antes de deploy em produção:

- [ ] Todos os testes passando
- [ ] Build local funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Migrations aplicadas
- [ ] Domínio configurado (opcional)
- [ ] Monitoramento ativo
- [ ] Backups configurados

---

## 📞 SUPORTE

### Vercel

- **Docs:** https://vercel.com/docs
- **Support:** https://vercel.com/support

### Supabase

- **Docs:** https://supabase.com/docs
- **Support:** https://supabase.com/support

---

**🚀 Deploy e Produção Documentados!**

**Status:** ✅ Sistema em Produção  
**URL:** https://financas-up.vercel.app
