# 💰 Finanças UP

> Sistema completo de gestão financeira pessoal e empresarial - Controle suas finanças com inteligência e simplicidade

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

## 📊 Visão Geral

O **Finanças UP** é um sistema completo de gestão financeira desenvolvido com as mais modernas tecnologias web. Permite controlar contas bancárias, cartões de crédito, investimentos, empréstimos, orçamentos e muito mais, tudo em uma interface intuitiva e responsiva.

### ✨ Características Principais

- 🎨 **Interface Moderna** - Design responsivo com TailwindCSS e shadcn/ui
- 📊 **Dashboard Completo** - Gráficos interativos e relatórios avançados
- 🔒 **Autenticação Segura** - NextAuth.js com JWT e múltiplos providers
- 📱 **PWA** - Funciona offline como aplicativo nativo
- 🌐 **Multi-usuário** - Compartilhamento familiar com controle de permissões
- 📈 **Insights Automáticos** - Análises inteligentes das finanças
- 🔄 **Conciliação Bancária** - Sincronização automática de transações
- 💾 **Backup Seguro** - Dados protegidos localmente e na nuvem

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (produção) ou SQLite (desenvolvimento)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/alphasinfo/financas-up.git
   cd financas-up
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o ambiente**
   ```bash
   cp .env.example .env.local
   # Edite o .env.local com suas configurações
   ```

4. **Configure o banco de dados**
   ```bash
   # Desenvolvimento (SQLite)
   npm run db:local

   # Produção (Supabase)
   npm run db:supabase
   ```

5. **Execute as migrações**
   ```bash
   npx prisma migrate dev
   ```

6. **Popular dados de teste** (opcional)
   ```bash
   npm run seed
   ```

7. **Inicie o servidor**
   ```bash
   npm run dev
   ```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
financas-up/
├── 📁 Documentos/           # 📚 Documentação completa organizada
│   ├── Modo-de-usar/       # 📖 Guias e manuais
│   ├── Configurações/      # ⚙️ Instalação e setup
│   ├── DocumentosTecnicos/ # 🏗️ Arquitetura e APIs
│   ├── Auditoria/          # 🔍 Testes e qualidade
│   └── relatorios/         # 📊 Relatórios do projeto
├── 📁 src/                 # 💻 Código fonte
│   ├── app/                # 🔌 Next.js App Router
│   ├── components/         # ⚛️ Componentes React
│   ├── lib/                # 🛠️ Utilitários e bibliotecas
│   └── types/              # 📝 Tipos TypeScript
├── 📁 prisma/              # 🗄️ Schema e migrações
├── 📁 scripts/             # 🔧 Scripts de automação
├── 📁 teste/               # 🧪 Testes centralizados
├── 📁 public/              # 🌐 Arquivos estáticos
└── 📄 [config files]       # ⚙️ Configurações
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14.2.18 (App Router)
- **Linguagem:** TypeScript 5.7.3
- **Styling:** TailwindCSS 3.4.17 + shadcn/ui
- **Gráficos:** Recharts 2.15.0
- **State Management:** React Query + Context API
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Next.js API Routes
- **ORM:** Prisma 5.22.0
- **Database:** PostgreSQL 15+ / SQLite (dev)
- **Authentication:** NextAuth.js 4.24.11
- **Validation:** Zod 3.25.76

### Infraestrutura
- **Deploy:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics
- **Version Control:** GitHub

## 🧪 Qualidade e Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes de integração
npm run test:integration

# Testes de APIs críticas
npm run test:api
npm run test:database
npm run test:critical
```

- ✅ **377 testes** em 22 suítes
- ✅ **100% dos testes passando**
- ✅ **Cobertura:** ~85%
- ✅ **Build:** Funcionando perfeitamente
- ✅ **Lint:** Sem erros

## 📊 Funcionalidades

### 💳 Gestão Financeira
- **Contas Bancárias** - Controle múltiplas contas
- **Cartões de Crédito** - Gestão de limites e faturas
- **Transações** - Registro detalhado de receitas/despesas
- **Categorias** - Organização personalizada
- **Orçamentos** - Planejamento mensal
- **Metas** - Objetivos financeiros

### 📈 Investimentos
- **Carteira de Investimentos** - Acompanhe seus ativos
- **Rendimentos** - Controle de rentabilidade
- **Diversificação** - Análise de risco

### 🤝 Empréstimos
- **Empréstimos Recebidos** - Controle de dívidas
- **Empréstimos Concedidos** - Gestão de créditos
- **Parcelas** - Acompanhamento automático

### 👥 Compartilhamento
- **Contas Familiares** - Acesso compartilhado
- **Permissões Granulares** - Controle de acesso
- **Sincronização** - Dados em tempo real

### 📊 Relatórios
- **Dashboard Executivo** - Visão geral completa
- **Relatórios Avançados** - Análises com IA
- **Insights Automáticos** - Recomendações inteligentes
- **Exportação** - PDF e Excel

## 🚀 Deploy e Produção

### Ambiente de Produção
- **URL:** [https://financas-up.vercel.app](https://financas-up.vercel.app)
- **Status:** ✅ Em produção
- **Uptime:** 99.9%
- **Performance:** Otimizado

### Processo de Deploy
```bash
# Build para produção
npm run build

# Deploy automático via Vercel
git push origin main
```

## 📚 Documentação

### 📖 Documentação Completa
Toda a documentação está organizada em `Documentos/`:

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| **[Instruções Obrigatórias](Documentos/Configurações/INSTRUCOES-OBRIGATORIAS.md)** | **REGRAS para equipe** | 5 min |
| **[Índice Completo](Documentos/Modo-de-usar/INDICE-DOCUMENTACAO.md)** | Guia da documentação | 2 min |
| **[Relatório Completo](Documentos/relatorios/00-RELATORIO-COMPLETO-PROJETO.md)** | Visão geral completa | 15 min |
| **[Auditoria 2025-10-22](Documentos/Auditoria/AUDITORIA-COMPLETA-2025-10-22.md)** | Análise técnica atual | 20 min |
| **[APIs e Endpoints](Documentos/DocumentosTecnicos/06-APIS-ENDPOINTS.md)** | Documentação técnica | 30 min |

### 🧪 Testes
- **[Documentação de Testes](teste/DOCUMENTACAO-TESTES.md)** - Cobertura e execução
- **[Plano de Testes](Documentos/Auditoria/PLANO-IMPLEMENTACAO-TESTES-2025-10-22.md)** - Estratégia futura

### ⚙️ Configuração
- **[Instalação Completa](Documentos/Configurações/02-INSTALACAO-COMPLETA.md)** - Setup detalhado
- **[Scripts e Comandos](Documentos/Configurações/09-SCRIPTS-COMANDOS.md)** - Automação

## 🤝 Contribuição

### Como Contribuir

1. **Leia as [Instruções Obrigatórias](Documentos/Configurações/INSTRUCOES-OBRIGATORIAS.md)**
2. **Siga o fluxo de trabalho** definido
3. **Execute os testes** antes de commit
4. **Atualize a documentação** se necessário

### Requisitos para Contribuição
- ✅ Seguir padrões de código
- ✅ Escrever testes para novas funcionalidades
- ✅ Atualizar documentação
- ✅ Commits descritivos
- ✅ Pull requests revisados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte e Contato

- **📧 Email:** suporte@financas-up.com
- **🐛 Issues:** [GitHub Issues](https://github.com/alphasinfo/financas-up/issues)
- **📖 Documentação:** [Documentos/](Documentos/)
- **🌐 Site:** [financas-up.vercel.app](https://financas-up.vercel.app)

## 🏆 Reconhecimentos

- **Next.js** - Framework React full-stack
- **Prisma** - ORM Type-Safe
- **shadcn/ui** - Componentes UI acessíveis
- **TailwindCSS** - Framework CSS utilitário
- **Vercel** - Plataforma de deploy

---

**💰 Gerencie suas finanças com inteligência e simplicidade**

**Desenvolvido com ❤️ pela equipe Finanças UP**

---

**📊 Métricas do Projeto:**
- ⭐ **Status:** Produção ✅
- 🧪 **Testes:** 377/377 passando
- 📈 **Performance:** Otimizado
- 🔒 **Segurança:** Avançada
- 📱 **Responsivo:** Mobile-first
