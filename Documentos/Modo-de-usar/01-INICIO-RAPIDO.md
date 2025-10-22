# ⚡ INÍCIO RÁPIDO - FINANÇAS UP

**Tempo estimado:** 5-10 minutos

---

## 🎯 OBJETIVO

Ter o sistema rodando localmente o mais rápido possível.

---

## 📋 PRÉ-REQUISITOS

- **Node.js** 18+ instalado
- **Git** instalado
- **PostgreSQL** 15+ (ou conta Supabase)

---

## 🚀 INSTALAÇÃO RÁPIDA

### 1. Clonar Repositório

```bash
git clone https://github.com/alphasinfo/financas-up.git
cd financas-up
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

#### Opção A: Usar Supabase (Recomendado)

1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Copiar URL de conexão

#### Opção B: PostgreSQL Local

```bash
# Criar banco
createdb financas_up
```

### 4. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env
nano .env
```

**Mínimo necessário:**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/financas_up"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gerar-com-comando-abaixo"
```

**Gerar NEXTAUTH_SECRET:**

```bash
node scripts/gerar-nextauth-secret.js
```

### 5. Configurar Banco

```bash
# Criar tabelas
npx prisma db push

# Gerar Prisma Client
npx prisma generate

# (Opcional) Popular com dados de teste
npm run seed
```

### 6. Iniciar Servidor

```bash
npm run dev
```

### 7. Acessar Sistema

Abra o navegador em: **http://localhost:3000**

---

## 🎉 PRONTO!

Você já pode:

1. **Criar conta** em `/cadastro`
2. **Fazer login** em `/login`
3. **Acessar dashboard** em `/dashboard`

---

## 🔧 SCRIPTS ÚTEIS

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor dev
npm run build            # Build de produção
npm run start            # Iniciar produção

# Banco de Dados
npx prisma studio        # Interface visual do banco
npx prisma db push       # Aplicar mudanças no schema
npx prisma generate      # Gerar Prisma Client

# Testes
npm test                 # Executar testes
npm run test:watch       # Testes em watch mode
```

---

## 🆘 PROBLEMAS COMUNS

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar variável DATABASE_URL no .env
```

### Erro "Module not found"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Porta 3000 em uso

```bash
# Usar outra porta
PORT=3001 npm run dev
```

---

## 📚 PRÓXIMOS PASSOS

1. **[Instalação Completa](02-INSTALACAO-COMPLETA.md)** - Guia detalhado
2. **[Configuração](03-CONFIGURACAO-SISTEMA.md)** - Todas as configurações
3. **[Modo de Uso](04-MODO-DE-USO.md)** - Como usar o sistema

---

**⚡ Início Rápido Completo!**
