# 🗄️ BANCO DE DADOS - FINANÇAS UP

---

## 📊 SCHEMA PRISMA

### Usuario

```prisma
model Usuario {
  id                String              @id @default(cuid())
  nome              String
  email             String              @unique
  senha             String
  foto              String?
  criadoEm          DateTime            @default(now())
  atualizadoEm      DateTime            @updatedAt
  
  // Relações
  contas            ContaBancaria[]
  cartoes           CartaoCredito[]
  transacoes        Transacao[]
  categorias        Categoria[]
  emprestimos       Emprestimo[]
  investimentos     Investimento[]
  orcamentos        Orcamento[]
  metas             Meta[]
  notificacoes      Notificacao[]
  compartilhamentos Compartilhamento[]
}
```

### ContaBancaria

```prisma
model ContaBancaria {
  id             String       @id @default(cuid())
  usuarioId      String
  nome           String
  instituicao    String
  tipo           TipoConta
  saldoInicial   Decimal      @db.Decimal(10, 2)
  saldoAtual     Decimal      @db.Decimal(10, 2)
  cor            String?
  ativa          Boolean      @default(true)
  criadoEm       DateTime     @default(now())
  
  usuario        Usuario      @relation(fields: [usuarioId], references: [id])
  transacoes     Transacao[]
}

enum TipoConta {
  CORRENTE
  POUPANCA
  CARTEIRA
}
```

### CartaoCredito

```prisma
model CartaoCredito {
  id              String    @id @default(cuid())
  usuarioId       String
  nome            String
  bandeira        String
  limite          Decimal   @db.Decimal(10, 2)
  diaFechamento   Int
  diaVencimento   Int
  ativo           Boolean   @default(true)
  criadoEm        DateTime  @default(now())
  
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
  faturas         Fatura[]
}
```

### Transacao

```prisma
model Transacao {
  id                String          @id @default(cuid())
  usuarioId         String
  contaId           String?
  cartaoId          String?
  categoriaId       String
  tipo              TipoTransacao
  descricao         String
  valor             Decimal         @db.Decimal(10, 2)
  dataCompetencia   DateTime
  dataPagamento     DateTime?
  status            StatusTransacao @default(PENDENTE)
  observacoes       String?
  criadoEm          DateTime        @default(now())
  
  usuario           Usuario         @relation(fields: [usuarioId], references: [id])
  conta             ContaBancaria?  @relation(fields: [contaId], references: [id])
  categoria         Categoria       @relation(fields: [categoriaId], references: [id])
}

enum TipoTransacao {
  RECEITA
  DESPESA
}

enum StatusTransacao {
  PENDENTE
  PAGA
  ATRASADA
}
```

### Categoria

```prisma
model Categoria {
  id          String          @id @default(cuid())
  usuarioId   String?
  nome        String
  tipo        TipoTransacao
  icone       String?
  cor         String?
  padrao      Boolean         @default(false)
  criadoEm    DateTime        @default(now())
  
  usuario     Usuario?        @relation(fields: [usuarioId], references: [id])
  transacoes  Transacao[]
  orcamentos  Orcamento[]
}
```

### Emprestimo

```prisma
model Emprestimo {
  id              String    @id @default(cuid())
  usuarioId       String
  descricao       String
  valorTotal      Decimal   @db.Decimal(10, 2)
  taxaJuros       Decimal   @db.Decimal(5, 2)
  numeroParcelas  Int
  parcelasPagas   Int       @default(0)
  status          String    @default("ATIVO")
  criadoEm        DateTime  @default(now())
  
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
}
```

### Investimento

```prisma
model Investimento {
  id              String    @id @default(cuid())
  usuarioId       String
  tipo            String
  valor           Decimal   @db.Decimal(10, 2)
  rentabilidade   Decimal   @db.Decimal(5, 2)
  dataAplicacao   DateTime
  dataVencimento  DateTime?
  criadoEm        DateTime  @default(now())
  
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
}
```

### Orcamento

```prisma
model Orcamento {
  id              String    @id @default(cuid())
  usuarioId       String
  categoriaId     String
  mesAno          String
  valorPlanejado  Decimal   @db.Decimal(10, 2)
  criadoEm        DateTime  @default(now())
  
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
  categoria       Categoria @relation(fields: [categoriaId], references: [id])
}
```

### Meta

```prisma
model Meta {
  id            String    @id @default(cuid())
  usuarioId     String
  nome          String
  valorObjetivo Decimal   @db.Decimal(10, 2)
  valorAtual    Decimal   @db.Decimal(10, 2) @default(0)
  prazo         DateTime?
  criadoEm      DateTime  @default(now())
  
  usuario       Usuario   @relation(fields: [usuarioId], references: [id])
}
```

---

## 🔗 RELACIONAMENTOS

```
Usuario (1) ─── (N) ContaBancaria
Usuario (1) ─── (N) CartaoCredito
Usuario (1) ─── (N) Transacao
Usuario (1) ─── (N) Categoria
Usuario (1) ─── (N) Emprestimo
Usuario (1) ─── (N) Investimento
Usuario (1) ─── (N) Orcamento
Usuario (1) ─── (N) Meta

ContaBancaria (1) ─── (N) Transacao
CartaoCredito (1) ─── (N) Fatura
Fatura (1) ─── (N) Transacao
Categoria (1) ─── (N) Transacao
Categoria (1) ─── (N) Orcamento
```

---

## 📝 QUERIES COMUNS

### Buscar Transações do Mês

```typescript
const transacoes = await prisma.transacao.findMany({
  where: {
    usuarioId: userId,
    dataCompetencia: {
      gte: new Date(2025, 0, 1),
      lte: new Date(2025, 0, 31)
    }
  },
  include: {
    categoria: true,
    conta: true
  },
  orderBy: {
    dataCompetencia: 'desc'
  }
});
```

### Calcular Saldo Total

```typescript
const contas = await prisma.contaBancaria.findMany({
  where: {
    usuarioId: userId,
    ativa: true
  }
});

const saldoTotal = contas.reduce((acc, conta) => 
  acc + Number(conta.saldoAtual), 0
);
```

### Buscar Orçamentos com Gastos

```typescript
const orcamentos = await prisma.orcamento.findMany({
  where: {
    usuarioId: userId,
    mesAno: '2025-01'
  },
  include: {
    categoria: {
      include: {
        transacoes: {
          where: {
            tipo: 'DESPESA',
            dataCompetencia: {
              gte: new Date(2025, 0, 1),
              lte: new Date(2025, 0, 31)
            }
          }
        }
      }
    }
  }
});
```

---

## 🔄 MIGRATIONS

### Criar Migration

```bash
npx prisma migrate dev --name nome-da-migration
```

### Aplicar Migrations

```bash
npx prisma migrate deploy
```

### Reset Banco

```bash
npx prisma migrate reset
```

---

## 🛠️ COMANDOS ÚTEIS

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema (dev)
npx prisma db push

# Interface visual
npx prisma studio

# Validar schema
npx prisma validate

# Formatar schema
npx prisma format
```

---

**🗄️ Banco de Dados Documentado!**
