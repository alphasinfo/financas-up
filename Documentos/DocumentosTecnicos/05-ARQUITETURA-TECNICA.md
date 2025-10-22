# 🏗️ ARQUITETURA TÉCNICA - FINANÇAS UP

---

## 📐 VISÃO GERAL

### Stack

**Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + TailwindCSS  
**Backend:** Next.js API Routes + Prisma ORM  
**Banco:** PostgreSQL 15+  
**Auth:** NextAuth.js (JWT)  
**Deploy:** Vercel + Supabase

### Padrões

- **Arquitetura:** Monolito Modular
- **Frontend:** Component-Based
- **Backend:** RESTful API
- **Banco:** Relacional Normalizado (3NF)

---

## 🎨 FRONTEND

### Estrutura

```
src/app/
├── (auth)/          # Rotas de autenticação
├── dashboard/       # Rotas protegidas
├── api/             # API Routes
├── layout.tsx       # Layout raiz
└── page.tsx         # Página inicial
```

### Componentes

```
src/components/
├── ui/              # Componentes base (shadcn)
├── layout/          # Header, Sidebar, Footer
└── [feature]/       # Componentes por funcionalidade
```

### Estado

- **Local:** useState, useReducer
- **Global:** Context API
- **Server:** React Server Components
- **Cache:** SWR / React Query (futuro)

---

## 🔌 BACKEND

### API Routes

```typescript
// Padrão de API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  const dados = await prisma.model.findMany({
    where: { usuarioId: session.user.id }
  });
  
  return NextResponse.json(dados);
}
```

### Middleware

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 🗄️ BANCO DE DADOS

### Prisma Schema

```prisma
model Usuario {
  id        String   @id @default(cuid())
  nome      String
  email     String   @unique
  senha     String
  contas    ContaBancaria[]
  transacoes Transacao[]
  criadoEm  DateTime @default(now())
}
```

### Queries

```typescript
// Buscar com relações
const usuario = await prisma.usuario.findUnique({
  where: { id },
  include: {
    contas: true,
    transacoes: {
      take: 10,
      orderBy: { criadoEm: 'desc' }
    }
  }
});
```

---

## 🔐 AUTENTICAÇÃO

### Fluxo

1. Usuário faz login
2. NextAuth valida credenciais
3. Gera JWT com dados do usuário
4. Armazena em cookie httpOnly
5. Middleware valida em cada requisição

### JWT Payload

```json
{
  "id": "user-id",
  "email": "user@email.com",
  "nome": "Nome Usuario",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 📊 FLUXOS PRINCIPAIS

### Criar Transação

```
1. Usuário preenche formulário
2. Frontend valida (Zod)
3. POST /api/transacoes
4. Middleware valida sessão
5. API valida dados
6. Prisma insere no banco
7. Atualiza saldo da conta
8. Retorna transação criada
9. Frontend atualiza UI
```

### Dashboard

```
1. Usuário acessa /dashboard
2. Server Component busca dados
3. Prisma agrega transações
4. Calcula saldos e totais
5. Renderiza no servidor
6. Envia HTML para cliente
7. Hidrata componentes interativos
```

---

## 🎯 PADRÕES DE CÓDIGO

### Nomenclatura

- **Componentes:** PascalCase (`Button.tsx`)
- **Funções:** camelCase (`getUserData`)
- **Constantes:** UPPER_CASE (`API_URL`)
- **Arquivos:** kebab-case (`user-profile.tsx`)

### Estrutura de Arquivo

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types
interface Props { ... }

// 3. Component
export function Component({ ...props }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Functions
  const handleClick = () => { ... };
  
  // 6. Effects
  useEffect(() => { ... }, []);
  
  // 7. Render
  return <div>...</div>;
}
```

---

## 🧪 TESTES

### Estrutura

```
__tests__/
├── unit/            # Testes unitários
├── integration/     # Testes de integração
└── e2e/             # Testes end-to-end
```

### Exemplo

```typescript
describe('Transacao API', () => {
  it('deve criar transação', async () => {
    const response = await POST('/api/transacoes', {
      descricao: 'Teste',
      valor: 100,
      tipo: 'RECEITA'
    });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## 🚀 PERFORMANCE

### Otimizações

- **SSR:** Páginas renderizadas no servidor
- **ISR:** Revalidação incremental
- **Code Splitting:** Lazy loading de componentes
- **Image Optimization:** Next/Image
- **Font Optimization:** Next/Font

### Métricas

- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1

---

## 📦 BUILD

### Processo

```bash
1. npm run build
2. Prisma generate
3. Next.js build
4. Otimização de assets
5. Geração de páginas estáticas
6. Bundle de JavaScript
7. Minificação
8. Output em .next/
```

---

**🏗️ Arquitetura Documentada!**
