# 🔒 AUDITORIA DE SEGURANÇA - PROBLEMAS CRÍTICOS
## Finanças UP - Outubro 2025

---

## 🚨 AÇÃO IMEDIATA NECESSÁRIA

### 1. 🔴 VULNERABILIDADES DE DEPENDÊNCIAS (CRÍTICO)

**npm audit detectou 6 vulnerabilidades:**
- **1 CRÍTICA:** next@14.2.18 - Authorization Bypass (CVSS 9.1)
- **2 ALTAS:** jspdf (ReDoS/DoS), jspdf-autotable
- **3 MODERADAS:** nodemailer, dompurify, next-auth

**CORREÇÃO IMEDIATA:**
```bash
npm install next@14.2.33 jspdf@3.0.3 jspdf-autotable@5.0.2 nodemailer@7.0.9
npm audit fix
npm test
git commit -m "security: Update vulnerable dependencies"
```

---

### 2. 🔴 ROTA DE DEBUG EXPOSTA (`/api/debug-login`)

**Riscos:**
- Enumera todos os emails cadastrados
- Expõe stack traces completas
- Permite ataques direcionados

**CORREÇÃO:**
```typescript
// src/app/api/debug-login/route.ts
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ erro: 'Not found' }, { status: 404 });
  }
  // ... resto do código apenas em dev
}
```

---

### 3. 🔴 DEBUG MODE ATIVO EM PRODUÇÃO

**Arquivo:** `src/lib/auth.ts:133`

**CORREÇÃO:**
```typescript
// Linha 133
debug: process.env.NODE_ENV === 'development',  // ✅ Apenas em dev
```

---

### 4. 🔴 CREDENCIAIS EXPOSTAS NO REPOSITÓRIO

**Arquivo:** `.env.supabase` (commitado no GitHub)

**AÇÃO IMEDIATA:**
1. Rotacionar senha do banco no Supabase
2. Gerar novo NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Remover do Git:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.supabase" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```
4. Adicionar ao .gitignore:
```gitignore
.env
.env.*
!.env.example
```

---

## 🟠 PROBLEMAS DE ALTA PRIORIDADE

### 5. AUSÊNCIA DE RATE LIMITING

**Rotas vulneráveis:**
- `/api/auth/[...nextauth]` (login)
- `/api/usuarios/cadastro`
- `/api/transacoes`

**CORREÇÃO:**
```typescript
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const limit = rateLimit(identifier, RATE_LIMITS.PUBLIC);
  
  if (!limit.success) {
    return NextResponse.json(
      { erro: 'Muitas tentativas. Aguarde.' },
      { status: 429 }
    );
  }
  // ... resto
}
```

---

### 6. AUSÊNCIA DE ROW LEVEL SECURITY (RLS) NO SUPABASE

**CRÍTICO:** Dados podem ser acessados diretamente pelo PostgreSQL.

**CORREÇÃO:**
```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "users_own_data" ON usuarios
  FOR ALL USING (auth.uid()::text = id);

CREATE POLICY "users_own_accounts" ON contas_bancarias
  FOR ALL USING (auth.uid()::text = "usuarioId");

-- Repetir para todas as tabelas
```

---

### 7. LOGS EXCESSIVOS EM PRODUÇÃO

**Problema:** console.log com dados sensíveis em 51 arquivos.

**CORREÇÃO:**
```typescript
// Substituir console.log por logger estruturado
import { log } from '@/lib/logger';

// ❌ console.log('Login:', email);
// ✅ log.auth('login', userId);
```

**Remover de:**
- `src/lib/auth.ts`
- `src/app/api/transacoes/route.ts`
- Todas as rotas de API

---

### 8. VALIDAÇÃO ZOD INCONSISTENTE

**Problema:** Nem todas as rotas validam entrada.

**CORREÇÃO:** Aplicar Zod em TODAS as rotas POST/PUT/PATCH:
```typescript
const schema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email(),
}).strict();  // Rejeita campos extras

const validacao = schema.safeParse(body);
if (!validacao.success) {
  return NextResponse.json(
    { erro: validacao.error.errors[0].message },
    { status: 400 }
  );
}
```

---

### 9. AUSÊNCIA DE CSRF PROTECTION

**CORREÇÃO:** Criar middleware:
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const cookieToken = request.cookies.get('next-auth.csrf-token');
    
    if (!csrfToken || csrfToken !== cookieToken?.value) {
      return NextResponse.json({ erro: 'CSRF inválido' }, { status: 403 });
    }
  }
  return NextResponse.next();
}
```

---

### 10. HEADERS DE SEGURANÇA INCOMPLETOS

**Adicionar ao `next.config.mjs`:**
```javascript
{
  key: 'X-Frame-Options',
  value: 'DENY'
},
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
},
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; frame-ancestors 'none'; base-uri 'self';"
}
```

---

## ✅ CHECKLIST DE CORREÇÕES

- [ ] Atualizar dependências vulneráveis
- [ ] Remover/proteger rota de debug
- [ ] Desativar debug em produção
- [ ] Rotacionar credenciais expostas
- [ ] Implementar rate limiting
- [ ] Configurar RLS no Supabase
- [ ] Remover console.log sensíveis
- [ ] Validar todas as entradas com Zod
- [ ] Implementar CSRF protection
- [ ] Adicionar headers de segurança
- [ ] Configurar timeout no Prisma
- [ ] Criar middleware de autenticação

---

**Prioridade:** URGENTE  
**Prazo:** 48 horas  
**Impacto:** ALTO - Segurança comprometida
