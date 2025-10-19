# 📚 Documentação Completa - Finanças UP

Sistema completo de gestão financeira pessoal e empresarial com recursos avançados.

## 📖 Índice

1. [Sobre o Sistema](#sobre-o-sistema)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Uso](#uso)
7. [API](#api)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Manutenção](#manutenção)

---

## 🎯 Sobre o Sistema

**Finanças UP** é uma plataforma moderna e completa para gestão financeira que oferece:

- 💰 Controle total de receitas e despesas
- 💳 Gestão de cartões de crédito e faturas
- 🏦 Múltiplas contas bancárias
- 📊 Relatórios avançados e dashboards
- 🎯 Metas financeiras
- 💵 Orçamentos personalizados
- 🤝 Compartilhamento familiar
- 📱 Notificações push
- 🌍 Multi-moeda
- 💾 Modo offline
- 🏦 Integração bancária
- 🔒 Segurança avançada

---

## ⚡ Funcionalidades

### 1. **Gestão Financeira Básica**
- ✅ Cadastro de receitas e despesas
- ✅ Categorização automática
- ✅ Anexos e comprovantes
- ✅ Transações recorrentes
- ✅ Filtros avançados

### 2. **Cartões de Crédito**
- ✅ Múltiplos cartões
- ✅ Faturas automáticas
- ✅ Controle de limite
- ✅ Alertas de vencimento
- ✅ Parcelamento

### 3. **Contas Bancárias**
- ✅ Múltiplas contas
- ✅ Transferências entre contas
- ✅ Saldo consolidado
- ✅ Histórico completo

### 4. **Investimentos**
- ✅ Cadastro de investimentos
- ✅ Rentabilidade
- ✅ Diversificação
- ✅ Metas de investimento

### 5. **Empréstimos**
- ✅ Controle de empréstimos
- ✅ Parcelas e juros
- ✅ Amortização
- ✅ Simulações

### 6. **Metas Financeiras**
- ✅ Criação de metas
- ✅ Acompanhamento de progresso
- ✅ Contribuições
- ✅ Alertas

### 7. **Orçamentos**
- ✅ Orçamento mensal
- ✅ Por categoria
- ✅ Alertas de limite
- ✅ Comparativos

### 8. **Relatórios Avançados** 🆕
- ✅ Comparação mês a mês
- ✅ Previsões com IA
- ✅ Insights automáticos
- ✅ Gráficos interativos
- ✅ Export PDF/Excel

### 9. **Backup Automático** 🆕
- ✅ Backup diário
- ✅ Export para Google Drive
- ✅ Restauração
- ✅ Versionamento

### 10. **Notificações Push** 🆕
- ✅ Web Push API
- ✅ Alertas de vencimento
- ✅ Resumo diário
- ✅ Notificações personalizadas

### 11. **Multi-moeda** 🆕
- ✅ 8 moedas suportadas
- ✅ Conversão automática
- ✅ Cotação em tempo real
- ✅ Cache de cotações

### 12. **Modo Offline** 🆕
- ✅ IndexedDB local
- ✅ Sync automático
- ✅ Conflict resolution
- ✅ Queue de operações

### 13. **Integração Bancária** 🆕
- ✅ Parser OFX/CSV
- ✅ Conciliação automática
- ✅ Categorização inteligente
- ✅ Open Banking (preparado)

### 14. **Compartilhamento Avançado** 🆕
- ✅ Orçamento familiar
- ✅ Permissões granulares
- ✅ Chat entre usuários
- ✅ Relatórios consolidados

---

## 🏗️ Arquitetura

### **Stack Tecnológica**

```
Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Shadcn/UI

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)

Autenticação:
- NextAuth.js
- JWT
- Bcrypt

Infraestrutura:
- Vercel (Deploy)
- Supabase (Database)
- GitHub Actions (CI/CD)

Testes:
- Jest
- React Testing Library
- 233 testes (100% passando)

Segurança:
- Rate Limiting
- CSRF Protection
- XSS Protection
- SQL Injection Protection
- Headers de Segurança
```

### **Estrutura de Pastas**

```
financas-up/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Páginas do dashboard
│   │   └── (auth)/            # Páginas de autenticação
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes UI (shadcn)
│   │   └── dashboard/        # Componentes do dashboard
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── __tests__/        # Testes
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── auth.ts           # Configuração NextAuth
│   │   └── ...               # Outras libs
│   └── middleware.ts          # Middleware global
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   └── migrations/           # Migrações
├── scripts/                   # Scripts utilitários
├── docs/                      # Documentação
├── public/                    # Arquivos estáticos
└── tests/                     # Testes E2E

```

---

## 🚀 Instalação

### **Pré-requisitos**

- Node.js 18+ 
- npm ou yarn
- PostgreSQL (ou conta Supabase)
- Git

### **Passo a Passo**

```bash
# 1. Clonar repositório
git clone https://github.com/alphasinfo/financas-up.git
cd financas-up

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Configurar banco de dados
npx prisma generate
npx prisma db push

# 5. Executar em desenvolvimento
npm run dev

# 6. Acessar
# http://localhost:3000
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente**

Consulte o arquivo `.env.example` para todas as variáveis necessárias.

**Principais:**

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# Email (Resend)
RESEND_API_KEY="re_..."

# Sentry (Opcional)
SENTRY_DSN="..."
```

---

## 📘 Uso

Consulte a documentação específica em:

- [Guia do Usuário](./GUIA-USUARIO.md)
- [Guia do Desenvolvedor](./GUIA-DESENVOLVEDOR.md)
- [API Reference](./API.md)

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar em watch mode
npm run test:watch

# Executar build e testes
npm run verify
```

**Estatísticas:**
- ✅ 233 testes
- ✅ 100% passando
- ✅ Coverage > 80%

---

## 🌐 Deploy

### **Vercel (Recomendado)**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### **Outras Plataformas**

- Docker
- AWS
- Google Cloud
- Azure

Consulte [DEPLOY.md](./DEPLOY.md) para mais detalhes.

---

## 🔧 Manutenção

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test

# Lint
npm run lint

# Format
npm run format

# Prisma
npm run prisma:generate
npm run prisma:push
npm run prisma:studio

# Pre-commit (automático)
npm run pre-commit
```

### **Backup**

```bash
# Backup manual do banco
npm run backup:db

# Restore
npm run restore:db
```

---

## 📞 Suporte

- **Email:** suporte@financasup.com
- **GitHub Issues:** [github.com/alphasinfo/financas-up/issues](https://github.com/alphasinfo/financas-up/issues)
- **Documentação:** [docs.financasup.com](https://docs.financasup.com)

---

## 📄 Licença

MIT License - Veja [LICENSE](../LICENSE) para mais detalhes.

---

## 👥 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para guidelines.

---

## 🎯 Roadmap

- [ ] App Mobile (React Native)
- [ ] Integração com mais bancos
- [ ] IA para categorização
- [ ] Análise preditiva avançada
- [ ] Multi-idioma
- [ ] Tema escuro/claro
- [ ] PWA completo

---

**Desenvolvido com ❤️ pela equipe Alphas Info**
