# 💰 Finanças UP

> Sistema completo de gestão financeira pessoal com controle de contas, cartões, investimentos e muito mais!

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação Rápida](#instalação-rápida)
- [Documentação](#documentação)
- [Scripts de Instalação](#scripts-de-instalação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**Finanças UP** é um sistema completo de gestão financeira pessoal que permite controlar todas as suas finanças em um só lugar. Com interface moderna e intuitiva, você pode gerenciar contas bancárias, cartões de crédito, investimentos, empréstimos e muito mais.

### ✨ Diferenciais

- 🎨 **Interface Moderna** - Design limpo e responsivo
- 📊 **Dashboard Completo** - Visualize suas finanças em tempo real
- 🔒 **Seguro** - Autenticação robusta com NextAuth
- 📱 **PWA** - Funciona como app no celular
- 📈 **Relatórios** - Análises detalhadas de gastos
- 🌐 **Multi-dispositivo** - Acesse de qualquer lugar

---

## 🚀 Funcionalidades

### 💳 Gestão de Contas Bancárias
- ✅ Cadastro de contas (Corrente, Poupança, Carteira)
- ✅ Visualização de saldos em tempo real
- ✅ Histórico completo de transações
- ✅ Ativar/desativar contas
- ✅ Edição e exclusão

### 💳 Cartões de Crédito
- ✅ Gerenciamento de múltiplos cartões
- ✅ Controle de limite disponível
- ✅ Faturas mensais automáticas
- ✅ Pagamento de faturas
- ✅ Histórico de compras

### 💰 Transações Financeiras
- ✅ Registro de receitas e despesas
- ✅ Categorização inteligente
- ✅ Transações parceladas
- ✅ Transações recorrentes
- ✅ Filtros e busca avançada

### 📊 Empréstimos
- ✅ Controle de empréstimos ativos
- ✅ Gestão de parcelas
- ✅ Cálculo automático de juros
- ✅ Alertas de vencimento

### 📈 Investimentos
- ✅ Registro de aplicações
- ✅ Acompanhamento de rentabilidade
- ✅ Diversificação de carteira

### 🎯 Orçamentos e Metas
- ✅ Orçamentos mensais por categoria
- ✅ Acompanhamento em tempo real
- ✅ Metas financeiras
- ✅ Alertas de limite

### 📊 Relatórios e Insights
- ✅ Dashboard interativo
- ✅ Gráficos de receitas vs despesas
- ✅ Análise por categoria
- ✅ Insights automáticos
- ✅ Exportação de dados

### 🔄 Conciliação Bancária
- ✅ Importação de extratos (CSV, OFX, XML, CNAB)
- ✅ Matching automático
- ✅ Revisão e confirmação

---

## 🛠️ Tecnologias

### Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[TailwindCSS](https://tailwindcss.com/)** - Estilização
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Recharts](https://recharts.org/)** - Gráficos interativos

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - API REST
- **[Prisma](https://www.prisma.io/)** - ORM TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticação
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas

### Infraestrutura
- **[Vercel](https://vercel.com/)** - Deploy e hospedagem
- **[Supabase](https://supabase.com/)** - PostgreSQL gerenciado
- **[GitHub](https://github.com/)** - Controle de versão

---

## 🚀 Instalação Rápida

### Linux (Manjaro/Arch)
```bash
git clone <url-do-repositorio>
cd financas-up
chmod +x scripts/manjaro/install.sh
./scripts/manjaro/install.sh
```

### Linux (Debian/Ubuntu)
```bash
git clone <url-do-repositorio>
cd financas-up
chmod +x scripts/debian/install.sh
./scripts/debian/install.sh
```

### Windows
```powershell
# PowerShell como Administrador
cd C:\caminho\para\financas-up
.\scripts\windows\install.ps1
```

### Manual
```bash
npm install
npx prisma db push
npx prisma generate
npm run seed  # Opcional
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📚 Documentação

- ⚡ **[Início Rápido](docs/sistema/INICIO-RAPIDO.md)** - Comece em 5 minutos
- 📘 **[Instalação](docs/sistema/INSTALACAO.md)** - Guia completo de instalação
- 📖 **[Como Usar](docs/sistema/COMO_USAR.md)** - Como usar o sistema
- ⚙️ **[Configuração](docs/sistema/CONFIGURACAO.md)** - Configurações do sistema
- 📜 **[Comandos](docs/scripts/COMANDOS-DISPONIVEIS.md)** - Scripts e comandos disponíveis

**Ver todos:** [docs/INDICE-DOCUMENTACAO.md](docs/INDICE-DOCUMENTACAO.md)

---

## 🔧 Scripts de Instalação

O projeto inclui scripts automatizados para diferentes sistemas operacionais:

| Sistema | Script | Descrição |
|---------|--------|-----------|
| **Manjaro/Arch** | `scripts/manjaro/install.sh` | Instalação automática para Arch-based |
| **Debian/Ubuntu** | `scripts/debian/install.sh` | Instalação automática para Debian-based |
| **Windows** | `scripts/windows/install.ps1` | Instalação automática para Windows |

**Todos os scripts incluem:**
- ✅ Verificação de dependências
- ✅ Instalação do Node.js (se necessário)
- ✅ **Backup automático do .env** (se existir)
- ✅ Instalação de dependências do projeto
- ✅ Configuração do banco de dados
- ✅ Geração do Prisma Client
- ✅ Opção de popular banco com dados de teste

📚 **[Documentação completa de scripts](docs/scripts/README.md)**

---

## 📚 Documentação Original

- 📘 **[CONFIGURACAO.md (Original)](CONFIGURACAO.md)** - Configuração completa (Local + Supabase + Vercel)
- 📖 **[COMO_USAR.md](COMO_USAR.md)** - Guia completo de uso do sistema
- 🔧 **[SCRIPTS.md](SCRIPTS.md)** - Comandos e scripts úteis
- 📧 **[EMAIL_RELATORIOS.md](EMAIL_RELATORIOS.md)** - Configurar envio automático de relatórios

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja como contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido com ❤️

---

<div align="center">

**Finanças UP** - Seu controle financeiro pessoal completo! 💰✨

[⬆ Voltar ao topo](#-finanças-up)

</div>
