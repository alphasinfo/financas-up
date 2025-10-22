# Estrutura do Projeto Financas-Up

## Visão Geral
Este documento descreve a estrutura completa do projeto Financas-Up, incluindo arquitetura, tecnologias utilizadas, estrutura de pastas, modelos de dados e informações essenciais para consulta e desenvolvimento.

## Tecnologias Utilizadas
- **Framework**: Next.js 14.2.18 (React)
- **Banco de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Gráficos**: Recharts, Chart.js
- **Testes**: Jest, Testing Library
- **Deploy**: Vercel / Netlify
- **Monitoramento**: Sentry

## Estrutura de Pastas

### Raiz do Projeto
```
/
├── Documentos/           # Documentação reorganizada
├── prisma/              # Configuração do banco de dados
├── public/              # Arquivos estáticos
├── scripts/             # Scripts de automação (reorganizados)
├── src/                 # Código fonte
├── teste/               # Testes organizados
├── .env.example         # Variáveis de ambiente exemplo
├── package.json         # Dependências e scripts
├── tailwind.config.ts   # Configuração Tailwind
├── next.config.mjs      # Configuração Next.js
└── jest.config.js       # Configuração de testes
```

### Pasta src/
```
src/
├── app/                 # Páginas Next.js (App Router)
├── components/          # Componentes React
├── config/              # Configurações
├── contexts/            # Contextos React
├── hooks/               # Hooks customizados
├── lib/                 # Utilitários e bibliotecas
├── types/               # Tipos TypeScript
├── middleware.ts        # Middleware Next.js
└── instrumentation.ts   # Configuração de instrumentação
```

## Modelos de Dados (Prisma Schema)

### Tabelas Principais

#### Usuario (usuarios)
- **ID**: String (CUID)
- **Campos principais**: nome, email, senha, imagem, logo
- **Configurações**: notificações, SMTP, 2FA
- **Relacionamentos**: contas, cartões, transações, etc.

#### ContaBancaria (contas_bancarias)
- **ID**: String (CUID)
- **Campos**: nome, instituicao, agencia, numero, tipo
- **Saldos**: saldoInicial, saldoAtual, saldoDisponivel
- **Crédito**: temLimiteCredito, limiteCredito
- **Status**: ativa, cor

#### CartaoCredito (cartoes_credito)
- **ID**: String (CUID)
- **Campos**: nome, banco, bandeira, apelido, numeroMascara
- **Limites**: limiteTotal, limiteDisponivel
- **Datas**: diaFechamento, diaVencimento
- **Status**: ativo, cor

#### Transacao (transacoes)
- **ID**: String (CUID)
- **Campos**: tipo, descricao, valor, dataCompetencia, dataLiquidacao
- **Status**: status (PENDENTE/CONFIRMADA)
- **Parcelamento**: parcelado, parcelaAtual, parcelaTotal
- **Relacionamentos**: categoria, contaBancaria, cartaoCredito, fatura, usuario

#### Categoria (categorias)
- **ID**: String (CUID)
- **Campos**: nome, tipo, cor, icone
- **Relacionamentos**: usuario, orcamentos, transacoes

#### Fatura (faturas)
- **ID**: String (CUID)
- **Referência**: cartaoId, mesReferencia, anoReferencia
- **Datas**: dataFechamento, dataVencimento
- **Valores**: valorTotal, valorPago
- **Status**: status (ABERTA/PAGA)

#### Emprestimo (emprestimos)
- **ID**: String (CUID)
- **Campos**: instituicao, descricao, valorTotal, valorParcela
- **Parcelas**: numeroParcelas, parcelasPagas
- **Taxas**: taxaJuros, taxaJurosMensal, taxaJurosAnual
- **Sistema**: sistemaAmortizacao (PRICE/SAC)
- **Datas**: dataContratacao, diaVencimento

#### Investimento (investimentos)
- **ID**: String (CUID)
- **Campos**: nome, tipo, valorAplicado, valorAtual
- **Rendimento**: taxaRendimento
- **Datas**: dataAplicacao, dataVencimento

#### Orcamento (orcamentos)
- **ID**: String (CUID)
- **Campos**: nome, valorLimite, valorGasto
- **Referência**: mesReferencia, anoReferencia
- **Relacionamentos**: categoria, usuario

#### Meta (metas)
- **ID**: String (CUID)
- **Campos**: titulo, descricao, valorAlvo, valorAtual
- **Datas**: dataInicio, dataPrazo
- **Status**: status (EM_ANDAMENTO/CONCLUIDA)

### Tabelas de Relacionamento e Suporte

#### PagamentoFatura (pagamentos_fatura)
Liga pagamentos a faturas e contas bancárias/emprestimos

#### ParcelasEmprestimo (parcelas_emprestimo)
Detalhes de cada parcela de empréstimo

#### Conciliacao (conciliacoes)
Registros de importação de dados bancários

#### CompartilhamentoConta (compartilhamentos_conta)
Compartilhamento de contas entre usuários

#### ConviteCompartilhamento (convites_compartilhamento)
Convites para compartilhamento

#### LogAcesso (logs_acesso)
Logs de auditoria de acessos

## APIs e Endpoints

### Estrutura de Rotas (src/app/)
- `/` - Página inicial
- `/login` - Autenticação
- `/dashboard` - Painel principal
- `/contas` - Gerenciamento de contas
- `/cartoes` - Gerenciamento de cartões
- `/transacoes` - Lista de transações
- `/categorias` - Gerenciamento de categorias
- `/orcamentos` - Orçamentos
- `/relatorios` - Relatórios financeiros
- `/perfil` - Configurações do usuário

### Componentes Principais
- `Dashboard` - Visão geral financeira
- `TransactionList` - Lista de transações
- `AccountCard` - Card de conta bancária
- `CreditCard` - Card de cartão de crédito
- `BudgetChart` - Gráfico de orçamento
- `ComparisonChart` - Gráfico comparativo

## Scripts e Automação

### Scripts de Banco de Dados
- `db:local` - Configurar para SQLite local
- `db:supabase` - Configurar para Supabase
- `seed` - Popular banco com dados de teste
- `reset-db` - Resetar e recriar banco

### Scripts de Build e Deploy
- `build` - Build otimizado
- `build:netlify` - Build específico Netlify
- `build:local` - Build local
- `deploy` - Deploy automático

## Variáveis de Ambiente

### Desenvolvimento (.env.local)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Produção (.env.production)
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
SENTRY_DSN="..."
```

## Configurações Importantes

### Jest (jest.config.js)
- Testes organizados na pasta `teste/` (centralizados)
- Ambiente: jsdom
- Cobertura: src/ exceto __tests__
- Padrões: `**/__tests__/**/*.[jt]s?(x)`, `teste/**/*.[jt]s?(x)`

### Scripts Organizados
```
scripts/
├── build/               # Scripts de build e otimização
├── database/            # Scripts de banco de dados e migrações
├── setup/               # Scripts de configuração inicial
├── auth/                # Scripts de autenticação
├── data/                # Scripts de dados e seeds
├── quality/             # Scripts de qualidade e testes
├── install/             # Scripts de instalação
└── utils/               # Utilitários diversos
```

### Next.js
- App Router
- TypeScript
- Middleware para autenticação
- Configuração otimizada para produção

## Informações de Consulta Rápida

### IDs de Modelos
- Usuario: `usuarios`
- ContaBancaria: `contas_bancarias` (exemplo: bancoconta)
- CartaoCredito: `cartoes_credito`
- Transacao: `transacoes`
- Categoria: `categorias`
- Fatura: `faturas`
- Emprestimo: `emprestimos`
- Investimento: `investimentos`
- Orcamento: `orcamentos`
- Meta: `metas`

### Tipos de Transação
- RECEITA
- DESPESA
- TRANSFERENCIA

### Status de Transação
- PENDENTE
- CONFIRMADA
- CANCELADA

### Status de Fatura
- ABERTA
- FECHADA
- PAGA
- VENCIDA

### Tipos de Conta
- CONTA_CORRENTE
- CONTA_POUPANCA
- CONTA_SALARIO
- CONTA_INVESTIMENTO

### Permissões de Compartilhamento
- VISUALIZAR
- EDITAR
- ADMINISTRAR

Este documento deve ser atualizado conforme o projeto evolui.
