# 🔧 CORREÇÃO CONEXÃO BANCO - VERCEL + SUPABASE

**Data:** 19/01/2025  
**Erro:** `Can't reach database server at aws-1-sa-east-1.pooler.supabase.com:5432`

---

## 🐛 PROBLEMA IDENTIFICADO

### Erro no Vercel

```
PrismaClientInitializationError: Can't reach database server at 
`aws-1-sa-east-1.pooler.supabase.com:5432`
```

**Causa:** Problema de conexão entre Vercel e Supabase (connection pooling)

---

## ✅ CORREÇÕES APLICADAS

### 1. Otimização do Prisma Client

**Arquivo:** `src/lib/prisma.ts`

**Mudanças:**
- ✅ Removido `$connect()` automático
- ✅ Adicionado configuração explícita de datasource
- ✅ Graceful shutdown apenas em desenvolvimento
- ✅ Deixar Prisma gerenciar conexões automaticamente

**Código:**
```typescript
// Configurações otimizadas para Vercel + Supabase
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Não conectar automaticamente - deixar o Prisma gerenciar
// Isso evita problemas de connection pool no Vercel
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2. Retry Logic no Auth

**Arquivo:** `src/lib/auth.ts`

**Mudanças:**
- ✅ Adicionado retry automático (3 tentativas)
- ✅ Reconexão automática em caso de falha
- ✅ Logs detalhados de erro
- ✅ Timeout entre tentativas (1 segundo)

**Código:**
```typescript
// Tentar conectar ao banco com retry
let usuario = null;
let retries = 3;
let lastError = null;

while (retries > 0 && !usuario) {
  try {
    usuario = await prisma.usuario.findUnique({
      where: { email: credentials.email }
    });
    break;
  } catch (error: any) {
    lastError = error;
    retries--;
    
    // Se for erro de conexão, tentar reconectar
    if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
      console.error(`❌ Erro de conexão (tentativas: ${retries}):`, error.message);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await prisma.$connect();
        } catch (connectError) {
          console.error('❌ Erro ao reconectar:', connectError);
        }
      }
    } else {
      throw error;
    }
  }
}
```

---

## 🔍 VERIFICAR CONFIGURAÇÃO NO VERCEL

### 1. Verificar DATABASE_URL

**Acessar:** Vercel Dashboard → Projeto → Settings → Environment Variables

**Verificar:**
- [ ] `DATABASE_URL` está configurada
- [ ] Valor está correto
- [ ] Está marcada para **Production**, **Preview** e **Development**

### 2. Formato Correto da URL

**Supabase Connection Pooler (Recomendado para Vercel):**
```
postgresql://postgres:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Supabase Direct Connection (Alternativa):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Onde Encontrar as URLs

**No Supabase:**
1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **Database**
3. Em **Connection string**, escolha:
   - **Transaction** (com pgbouncer) - RECOMENDADO para Vercel
   - **Session** (direta) - Alternativa

### 4. Testar Conexão

**Via Vercel CLI:**
```bash
# Ver variáveis de ambiente
vercel env ls

# Testar em preview
vercel env pull .env.preview
```

---

## 🚀 CONFIGURAÇÃO RECOMENDADA

### DATABASE_URL no Vercel

**Usar Connection Pooler (Transaction Mode):**

```
postgresql://postgres:[SUA-SENHA]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

**Parâmetros importantes:**
- `pgbouncer=true` - Usa connection pooler
- `connection_limit=1` - Limite de 1 conexão por função serverless

### Alternativa: Direct Connection

Se connection pooler não funcionar, usar conexão direta:

```
postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres?connection_limit=1
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### No Supabase

- [ ] Projeto está ativo e rodando
- [ ] Database está online
- [ ] Não há pausas ou manutenções
- [ ] Connection pooler está habilitado

### No Vercel

- [ ] `DATABASE_URL` configurada corretamente
- [ ] Variável está em **Production**
- [ ] Redeploy após mudar variável
- [ ] Não há erros de build

### No Código

- [x] Prisma Client otimizado
- [x] Retry logic implementado
- [x] Logs de erro detalhados
- [x] Graceful shutdown configurado

---

## 🔧 COMANDOS ÚTEIS

### Verificar Conexão Local

```bash
# Testar conexão com Supabase
psql "postgresql://postgres:[SENHA]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# Ou usar Prisma Studio
npx prisma studio
```

### Verificar Logs no Vercel

```bash
# Ver logs em tempo real
vercel logs --follow

# Ver últimos 100 logs
vercel logs --limit 100

# Filtrar por erro
vercel logs | grep "error"
```

### Redeploy no Vercel

```bash
# Via CLI
vercel --prod

# Ou via Git
git push origin main
```

---

## 🎯 SOLUÇÃO RÁPIDA

### Passo 1: Atualizar DATABASE_URL no Vercel

1. Acesse Vercel Dashboard
2. Projeto → **Settings** → **Environment Variables**
3. Edite `DATABASE_URL`
4. Use o formato com connection pooler:
   ```
   postgresql://postgres:[SENHA]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```
5. Salve

### Passo 2: Redeploy

1. Vá em **Deployments**
2. Clique no último deployment
3. Clique em **"..."** → **"Redeploy"**
4. Aguarde ~2 minutos

### Passo 3: Testar

1. Acesse https://financas-up.vercel.app/login
2. Tente fazer login
3. Verifique logs: `vercel logs --follow`

---

## 🆘 SE AINDA NÃO FUNCIONAR

### Opção 1: Usar Conexão Direta

Trocar `DATABASE_URL` para conexão direta (sem pooler):

```
postgresql://postgres:[SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres?connection_limit=1
```

### Opção 2: Verificar Firewall

1. No Supabase, vá em **Settings** → **Database**
2. Em **Connection Pooling**, verificar se está habilitado
3. Em **Network Restrictions**, adicionar IPs do Vercel se necessário

### Opção 3: Aumentar Timeout

Adicionar parâmetros de timeout na URL:

```
postgresql://...?pgbouncer=true&connection_limit=1&connect_timeout=10&pool_timeout=10
```

---

## 📊 MONITORAMENTO

### Verificar Saúde do Banco

**No Supabase:**
- Dashboard → **Reports** → **Database**
- Verificar conexões ativas
- Verificar uso de CPU/memória

**No Vercel:**
- Dashboard → **Analytics**
- Verificar tempo de resposta
- Verificar taxa de erro

---

## ✅ RESULTADO ESPERADO

Após as correções:

- ✅ Login funcionando sem erro 401
- ✅ Sem erro de conexão com banco
- ✅ Logs limpos no Vercel
- ✅ Dashboard carregando normalmente

---

**🔧 Correções Aplicadas!**

**Próximo passo:** 
1. Fazer commit e push
2. Aguardar deploy no Vercel
3. Testar login em produção
4. Verificar logs

**Se o erro persistir:** Verificar `DATABASE_URL` no Vercel e usar connection pooler
