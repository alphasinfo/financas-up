# ⚙️ CONFIGURAÇÃO DO SISTEMA - FINANÇAS UP

---

## 📋 VARIÁVEIS DE AMBIENTE

### Essenciais

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"

# NextAuth (Autenticação)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="secret-gerado-com-32-caracteres"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Email (SMTP)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
SMTP_FROM="Finanças UP <noreply@financas-up.com>"
```

**Gmail:** Usar senha de app (não a senha normal)

### Monitoramento

```env
# Sentry
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="sua-org"
SENTRY_PROJECT="financas-up"

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

### Produção

```env
NODE_ENV="production"
NEXTAUTH_URL="https://seu-dominio.com"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

---

## 🗄️ CONFIGURAÇÃO DO BANCO

### Supabase

1. **Connection Pooling:** Usar `?pgbouncer=true` na URL
2. **SSL:** Automático
3. **Backups:** Diários automáticos

```env
DATABASE_URL="postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
```

### PostgreSQL Local

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/financas_up"
```

**Otimizações:**

```sql
-- postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

---

## 🔐 CONFIGURAÇÃO DE SEGURANÇA

### NextAuth

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Configuração
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
}
```

### Senhas

- **Hash:** bcrypt com 10 rounds
- **Mínimo:** 6 caracteres
- **Validação:** Zod schema

---

## 📧 CONFIGURAÇÃO DE EMAIL

### Gmail

1. Ativar verificação em 2 etapas
2. Gerar senha de app
3. Usar senha de app no `.env`

### SMTP Personalizado

```env
SMTP_HOST="mail.seudominio.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@seudominio.com"
SMTP_PASS="senha-segura"
```

---

## 🎨 CONFIGURAÇÃO DE TEMA

### TailwindCSS

```javascript
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      }
    }
  }
}
```

### Temas Disponíveis

- **Claro** (padrão)
- **Escuro**

---

## 📱 CONFIGURAÇÃO PWA

### manifest.json

```json
{
  "name": "Finanças UP",
  "short_name": "Finanças UP",
  "description": "Gestão financeira pessoal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### Service Worker

Configurado automaticamente pelo Next.js

---

## 🔧 CONFIGURAÇÃO DE DESENVOLVIMENTO

### VS Code

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### ESLint

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 🚀 CONFIGURAÇÃO DE PRODUÇÃO

### Vercel

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### Next.js

```javascript
// next.config.mjs
export default {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
}
```

---

## 📊 CONFIGURAÇÃO DE LOGS

### Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] `.env` configurado
- [ ] Banco de dados conectado
- [ ] NEXTAUTH_SECRET gerado
- [ ] Email configurado (opcional)
- [ ] Sentry configurado (opcional)
- [ ] Testes executados
- [ ] Build funcionando

---

**⚙️ Configuração Completa!**
