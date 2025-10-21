# 🚀 Guia de Deploy - Finanças UP

Este projeto está configurado para funcionar tanto no **Vercel** quanto no **Netlify**, ambos usando **Supabase** como banco de dados.

## 📋 Pré-requisitos

1. **Supabase**: Projeto criado e configurado
2. **GitHub**: Repositório conectado
3. **Vercel** ou **Netlify**: Conta criada

## 🔧 Configuração Automática

O projeto detecta automaticamente o ambiente de deploy:

- **Desenvolvimento**: Usa SQLite local (`dev.db`)
- **Vercel**: Usa PostgreSQL/Supabase (configurado via `vercel.json`)
- **Netlify**: Usa PostgreSQL/Supabase (configurado via `netlify.toml`)

## 🌐 Deploy no Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. Configure as variáveis de ambiente (veja seção abaixo)

### 2. Variáveis de Ambiente no Vercel
```bash
DATABASE_URL=postgresql://[sua-string-de-conexao-supabase]
NEXTAUTH_SECRET=[gerar-novo-secret]
NEXTAUTH_URL=https://[seu-projeto].vercel.app
NEXTAUTH_URL_INTERNAL=https://[seu-projeto].vercel.app
```

### 3. Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (padrão)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)

## 🌐 Deploy no Netlify

### 1. Conectar Repositório
1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente (veja seção abaixo)

### 2. Variáveis de Ambiente no Netlify
```bash
DATABASE_URL=postgresql://[sua-string-de-conexao-supabase]
NEXTAUTH_SECRET=[gerar-novo-secret]
NEXTAUTH_URL=https://[seu-projeto].netlify.app
NETLIFY=true
```

### 3. Build Settings
- **Base directory**: `./` (padrão)
- **Build command**: `npm run build:netlify`
- **Publish directory**: Deixe em branco (o plugin configura automaticamente)

### 4. Funções Netlify
Certifique-se de que as **Netlify Functions** estão habilitadas:
- Vá em "Site settings" → "Functions"
- **Functions directory**: `netlify/functions` (configurado automaticamente)

## 🔑 Configuração do Supabase

### 1. URL do Projeto
Use a connection string do Supabase:
```
postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10
```

### 2. Políticas RLS (Row Level Security)
Certifique-se de que as políticas RLS estão configuradas no Supabase para permitir acesso adequado.

### 3. Migrar Schema
Após conectar o banco:
```bash
npm run db:supabase  # Configura schema para PostgreSQL
npx prisma db push   # Cria tabelas no Supabase
npm run seed         # Popula dados iniciais
```

## 🔐 NextAuth Configuration

### Gerar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
# ou
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### URLs do NextAuth
- **Vercel**: `https://[projeto].vercel.app`
- **Netlify**: `https://[projeto].netlify.app`

## 🧪 Testes

### Testar Localmente
```bash
# SQLite (desenvolvimento)
npm run dev

# Supabase (produção)
npm run db:supabase
npm run dev
```

### Verificar Build
```bash
# Vercel build
npm run build

# Netlify build
npm run build:netlify
```

## 🚨 Troubleshooting

### Erro: "prisma generate" falha no Netlify
- Certifique-se de que `DATABASE_URL` está definida
- Verifique se o Supabase está acessível

### Erro: Functions não funcionam no Netlify
- Verifique se o Netlify Functions Plugin está instalado
- Confirme que `netlify.toml` está na raiz

### Erro: Build falha
- Verifique logs de build na plataforma
- Teste build local: `npm run build:netlify`

## 📊 Monitoramento

### Vercel Analytics
- Integrado automaticamente
- Métricas em tempo real

### Sentry
- Configurado para ambos os ambientes
- Captura erros automaticamente

## 🔄 Migração entre Plataformas

Para migrar de uma plataforma para outra:

1. **Configure variáveis** na nova plataforma
2. **Teste o build** localmente
3. **Faça deploy** na nova plataforma
4. **Atualize DNS** se necessário
5. **Teste funcionalidades** críticas
6. **Remova** deploy antigo se satisfeito

## 📞 Suporte

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
