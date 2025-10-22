# 🗄️ Banco de Dados - Finanças UP

Documentação completa do schema do banco de dados.

## 📊 Visão Geral

O sistema utiliza **PostgreSQL** via **Prisma ORM** com as seguintes características:

- ✅ 15 tabelas principais
- ✅ Relacionamentos complexos
- ✅ Índices otimizados
- ✅ Constraints de integridade
- ✅ Soft deletes
- ✅ Timestamps automáticos

---

## 📋 Tabelas

### **1. Usuario**
Armazena informações dos usuários do sistema.

```prisma
model Usuario {
  id                String   @id @default(cuid())
  nome              String
  email             String   @unique
  senha             String
  logo              String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relações
  transacoes        Transacao[]
  categorias        Categoria[]
  contasBancarias   ContaBancaria[]
  cartoes           CartaoCredito[]
  // ... outras relações
}
```

**Campos principais:**
- `id`: Identificador único (CUID)
- `email`: Email único para login
- `senha`: Hash bcrypt da senha
- `logo`: URL da logo/avatar do usuário

---

### **2. Transacao**
Registra todas as transações financeiras.

```prisma
model Transacao {
  id                String   @id @default(cuid())
  usuarioId         String
  descricao         String
  valor             Float
  tipo              TipoTransacao // RECEITA | DESPESA
  status            StatusTransacao // PENDENTE | PAGO | RECEBIDO
  dataCompetencia   DateTime
  categoriaId       String?
  contaBancariaId   String?
  cartaoCreditoId   String?
  recorrente        Boolean  @default(false)
  observacoes       String?
  anexos            String[] // URLs dos anexos
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relações
  usuario           Usuario  @relation(fields: [usuarioId])
  categoria         Categoria? @relation(fields: [categoriaId])
  contaBancaria     ContaBancaria? @relation(fields: [contaBancariaId])
  cartaoCredito     CartaoCredito? @relation(fields: [cartaoCreditoId])
}
```

**Enums:**
```prisma
enum TipoTransacao {
  RECEITA
  DESPESA
}

enum StatusTransacao {
  PENDENTE
  PAGO
  RECEBIDO
  CANCELADO
}
```

---

### **3. Categoria**
Categorias para organização de transações.

```prisma
model Categoria {
  id          String   @id @default(cuid())
  usuarioId   String
  nome        String
  tipo        TipoTransacao
  cor         String?
  icone       String?
  ativa       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relações
  usuario     Usuario  @relation(fields: [usuarioId])
  transacoes  Transacao[]
  orcamentos  Orcamento[]
}
```

---

### **4. ContaBancaria**
Contas bancárias do usuário.

```prisma
model ContaBancaria {
  id            String   @id @default(cuid())
  usuarioId     String
  nome          String
  tipo          TipoConta // CORRENTE | POUPANCA | INVESTIMENTO
  saldoInicial  Float
  saldoAtual    Float
  banco         String?
  agencia       String?
  conta         String?
  ativa         Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relações
  usuario       Usuario  @relation(fields: [usuarioId])
  transacoes    Transacao[]
}
```

---

### **5. CartaoCredito**
Cartões de crédito.

```prisma
model CartaoCredito {
  id              String   @id @default(cuid())
  usuarioId       String
  nome            String
  bandeira        String
  limite          Float
  limiteDisponivel Float
  diaFechamento   Int
  diaVencimento   Int
  ativo           Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  usuario         Usuario  @relation(fields: [usuarioId])
  transacoes      Transacao[]
  faturas         Fatura[]
}
```

---

### **6. Fatura**
Faturas de cartões de crédito.

```prisma
model Fatura {
  id              String   @id @default(cuid())
  cartaoCreditoId String
  mes             Int
  ano             Int
  valor           Float
  valorPago       Float    @default(0)
  dataVencimento  DateTime
  dataPagamento   DateTime?
  status          StatusFatura // ABERTA | FECHADA | PAGA | VENCIDA
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  cartaoCredito   CartaoCredito @relation(fields: [cartaoCreditoId])
}
```

---

### **7. Meta**
Metas financeiras.

```prisma
model Meta {
  id            String   @id @default(cuid())
  usuarioId     String
  nome          String
  descricao     String?
  valorAlvo     Float
  valorAtual    Float    @default(0)
  dataAlvo      DateTime?
  concluida     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relações
  usuario       Usuario  @relation(fields: [usuarioId])
  contribuicoes ContribuicaoMeta[]
}
```

---

### **8. Orcamento**
Orçamentos mensais por categoria.

```prisma
model Orcamento {
  id          String   @id @default(cuid())
  usuarioId   String
  categoriaId String
  mes         Int
  ano         Int
  valor       Float
  gasto       Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relações
  usuario     Usuario  @relation(fields: [usuarioId])
  categoria   Categoria @relation(fields: [categoriaId])
  
  @@unique([usuarioId, categoriaId, mes, ano])
}
```

---

### **9. Investimento**
Investimentos do usuário.

```prisma
model Investimento {
  id              String   @id @default(cuid())
  usuarioId       String
  nome            String
  tipo            TipoInvestimento
  valorInvestido  Float
  valorAtual      Float
  dataInicio      DateTime
  dataResgate     DateTime?
  rentabilidade   Float?
  ativo           Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  usuario         Usuario  @relation(fields: [usuarioId])
}
```

---

### **10. Emprestimo**
Empréstimos (concedidos ou recebidos).

```prisma
model Emprestimo {
  id              String   @id @default(cuid())
  usuarioId       String
  tipo            TipoEmprestimo // CONCEDIDO | RECEBIDO
  pessoa          String
  valor           Float
  valorPago       Float    @default(0)
  parcelas        Int
  parcelasPagas   Int      @default(0)
  dataInicio      DateTime
  dataVencimento  DateTime?
  juros           Float?
  quitado         Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  usuario         Usuario  @relation(fields: [usuarioId])
}
```

---

### **11. Notificacao**
Notificações do sistema.

```prisma
model Notificacao {
  id          String   @id @default(cuid())
  usuarioId   String
  titulo      String
  mensagem    String
  tipo        TipoNotificacao
  lida        Boolean  @default(false)
  link        String?
  createdAt   DateTime @default(now())
  
  // Relações
  usuario     Usuario  @relation(fields: [usuarioId])
}
```

---

### **12. Compartilhamento**
Compartilhamento de orçamentos/dados.

```prisma
model Compartilhamento {
  id              String   @id @default(cuid())
  proprietarioId  String
  compartilhadoComId String
  tipo            TipoCompartilhamento
  permissao       NivelPermissao
  ativo           Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  proprietario    Usuario  @relation("Proprietario", fields: [proprietarioId])
  compartilhadoCom Usuario @relation("CompartilhadoCom", fields: [compartilhadoComId])
}
```

---

### **13. LogAcesso**
Logs de acesso ao sistema.

```prisma
model LogAcesso {
  id          String   @id @default(cuid())
  usuarioId   String?
  ip          String
  userAgent   String?
  acao        String
  sucesso     Boolean
  detalhes    String?
  createdAt   DateTime @default(now())
  
  // Relações
  usuario     Usuario? @relation(fields: [usuarioId])
}
```

---

## 🔗 Relacionamentos

### **Diagrama de Relacionamentos**

```
Usuario
  ├── 1:N Transacao
  ├── 1:N Categoria
  ├── 1:N ContaBancaria
  ├── 1:N CartaoCredito
  ├── 1:N Meta
  ├── 1:N Orcamento
  ├── 1:N Investimento
  ├── 1:N Emprestimo
  └── 1:N Notificacao

CartaoCredito
  ├── 1:N Transacao
  └── 1:N Fatura

Categoria
  ├── 1:N Transacao
  └── 1:N Orcamento

ContaBancaria
  └── 1:N Transacao

Meta
  └── 1:N ContribuicaoMeta
```

---

## 📈 Índices

Índices criados para otimização de queries:

```prisma
// Transacao
@@index([usuarioId])
@@index([categoriaId])
@@index([dataCompetencia])
@@index([tipo])
@@index([status])

// Categoria
@@index([usuarioId])
@@index([tipo])

// ContaBancaria
@@index([usuarioId])

// CartaoCredito
@@index([usuarioId])

// Fatura
@@index([cartaoCreditoId])
@@index([mes, ano])

// Orcamento
@@index([usuarioId])
@@index([categoriaId])
@@unique([usuarioId, categoriaId, mes, ano])
```

---

## 🔒 Constraints

### **Unique Constraints**

```prisma
Usuario.email         @unique
Orcamento            @@unique([usuarioId, categoriaId, mes, ano])
```

### **Foreign Keys**

Todas as relações têm foreign keys com `onDelete: Cascade` ou `onDelete: SetNull` conforme apropriado.

---

## 🛠️ Migrations

### **Criar Migration**

```bash
npx prisma migrate dev --name nome_da_migration
```

### **Aplicar Migrations**

```bash
npx prisma migrate deploy
```

### **Reset Database**

```bash
npx prisma migrate reset
```

⚠️ **ATENÇÃO:** Apaga todos os dados!

---

## 📊 Queries Comuns

### **Buscar Transações do Mês**

```typescript
const transacoes = await prisma.transacao.findMany({
  where: {
    usuarioId: userId,
    dataCompetencia: {
      gte: new Date(ano, mes - 1, 1),
      lt: new Date(ano, mes, 1)
    }
  },
  include: {
    categoria: true,
    contaBancaria: true
  },
  orderBy: {
    dataCompetencia: 'desc'
  }
});
```

### **Calcular Saldo Total**

```typescript
const saldoTotal = await prisma.contaBancaria.aggregate({
  where: {
    usuarioId: userId,
    ativa: true
  },
  _sum: {
    saldoAtual: true
  }
});
```

### **Obter Gastos por Categoria**

```typescript
const gastosPorCategoria = await prisma.transacao.groupBy({
  by: ['categoriaId'],
  where: {
    usuarioId: userId,
    tipo: 'DESPESA',
    status: 'PAGO',
    dataCompetencia: {
      gte: inicioMes,
      lt: fimMes
    }
  },
  _sum: {
    valor: true
  }
});
```

---

## 🔧 Manutenção

### **Backup**

```bash
# PostgreSQL
pg_dump -U usuario -d financas_up > backup.sql

# Restore
psql -U usuario -d financas_up < backup.sql
```

### **Otimização**

```sql
-- Analisar tabelas
ANALYZE;

-- Reindexar
REINDEX DATABASE financas_up;

-- Vacuum
VACUUM ANALYZE;
```

---

## 📝 Arquivo SQL Principal

O schema completo está em:
- **Prisma Schema:** `prisma/schema.prisma`
- **SQL Export:** `SQL-PROJETO-NOVO.sql`

---

## 🔗 Links Úteis

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)

---

**Última atualização:** 19/01/2025
