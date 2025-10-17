# 📦 Guia de Instalação - Finanças UP

**Versão:** 1.0.0  
**Data:** 16 de Outubro de 2025

---

## 🎯 Requisitos do Sistema

### Requisitos Mínimos
- **Node.js:** 18.x ou superior (recomendado 20.x)
- **npm:** 9.x ou superior
- **Memória RAM:** 2GB mínimo
- **Espaço em Disco:** 500MB
- **Sistema Operacional:** Windows 10/11, Linux (Debian, Ubuntu, Manjaro), macOS

### Requisitos Recomendados
- **Node.js:** 20.x LTS
- **npm:** 10.x
- **Memória RAM:** 4GB ou mais
- **Espaço em Disco:** 1GB
- **Navegador:** Chrome, Firefox, Edge (versões recentes)

---

## 🐧 Instalação no Linux

### Manjaro / Arch Linux

```bash
# 1. Baixar o projeto
git clone <url-do-repositorio>
cd financas-up

# 2. Executar script de instalação
chmod +x scripts/install-manjaro.sh
./scripts/install-manjaro.sh
```

**O script irá:**
- ✅ Atualizar o sistema
- ✅ Instalar Node.js e npm
- ✅ Instalar Git
- ✅ Instalar dependências do projeto
- ✅ Configurar banco de dados
- ✅ Gerar Prisma Client
- ✅ (Opcional) Popular banco com dados de teste

---

### Debian / Ubuntu

```bash
# 1. Baixar o projeto
git clone <url-do-repositorio>
cd financas-up

# 2. Executar script de instalação
chmod +x scripts/install-debian.sh
./scripts/install-debian.sh
```

**O script irá:**
- ✅ Atualizar o sistema
- ✅ Instalar Node.js 20.x via NodeSource
- ✅ Instalar Git e build-essential
- ✅ Instalar dependências do projeto
- ✅ Configurar banco de dados
- ✅ Gerar Prisma Client
- ✅ (Opcional) Popular banco com dados de teste

---

## 🪟 Instalação no Windows

### Método 1: Script PowerShell (Recomendado)

```powershell
# 1. Abrir PowerShell como Administrador

# 2. Navegar até a pasta do projeto
cd C:\caminho\para\financas-up

# 3. Permitir execução de scripts (se necessário)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. Executar script de instalação
.\scripts\install-windows.ps1
```

### Método 2: Instalação Manual

1. **Instalar Node.js**
   - Download: https://nodejs.org/
   - Versão recomendada: 20.x LTS
   - Durante instalação, marcar "Add to PATH"

2. **Instalar Git** (Opcional)
   - Download: https://git-scm.com/download/win

3. **Baixar o projeto**
   ```powershell
   git clone <url-do-repositorio>
   cd financas-up
   ```

4. **Instalar dependências**
   ```powershell
   npm install
   ```

5. **Configurar banco de dados**
   ```powershell
   # Copiar arquivo de exemplo
   copy .env.example .env
   
   # Aplicar migrations
   npx prisma db push
   
   # Gerar Prisma Client
   npx prisma generate
   ```

6. **(Opcional) Popular banco com dados de teste**
   ```powershell
   npm run seed
   ```

---

## 🚀 Iniciando o Sistema

### Modo Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:3000**

### Modo Produção

```bash
# 1. Build do projeto
npm run build

# 2. Iniciar servidor
npm start
```

---

## 🔑 Credenciais Padrão

Se você executou o seed do banco de dados:

- **Email:** `admin@financas.com`
- **Senha:** `123456`

⚠️ **IMPORTANTE:** Altere essas credenciais após o primeiro acesso!

---

## 🗄️ Configuração do Banco de Dados

### SQLite (Padrão - Desenvolvimento)

O sistema usa SQLite por padrão, ideal para desenvolvimento e testes.

**Arquivo `.env`:**
```env
DATABASE_URL="file:./dev.db"
```

### PostgreSQL (Produção)

Para produção, recomendamos PostgreSQL.

**Arquivo `.env`:**
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/financas_up?schema=public"
```

**Aplicar migrations:**
```bash
npx prisma db push
npx prisma generate
```

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Compila para produção
npm start            # Inicia servidor de produção
npm run lint         # Verifica código
```

### Banco de Dados
```bash
npx prisma db push       # Aplica mudanças no banco
npx prisma generate      # Gera Prisma Client
npx prisma studio        # Abre interface visual do banco
npm run seed             # Popula banco com dados de teste
```

### Limpeza
```bash
npm run clean            # Limpa arquivos de build
rm -rf node_modules      # Remove dependências
npm install              # Reinstala dependências
```

---

## 🐛 Solução de Problemas

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma Client not generated"
```bash
# Regenerar Prisma Client
npx prisma generate
```

### Erro: "Port 3000 already in use"
```bash
# Matar processo na porta 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Database locked" (SQLite)
```bash
# Fechar todas as conexões e reiniciar
rm prisma/dev.db
npx prisma db push
npm run seed
```

### Erro de permissão no Linux
```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Ou executar com sudo (não recomendado)
sudo ./scripts/install-debian.sh
```

---

## 📱 Acesso via Rede Local

Para acessar o sistema de outros dispositivos na mesma rede:

1. **Descobrir seu IP local:**
   ```bash
   # Linux/Mac
   ip addr show
   
   # Windows
   ipconfig
   ```

2. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Acessar de outro dispositivo:**
   ```
   http://SEU_IP:3000
   ```

---

## 🔒 Segurança

### Produção

Antes de colocar em produção:

1. ✅ Alterar credenciais padrão
2. ✅ Configurar variáveis de ambiente seguras
3. ✅ Usar PostgreSQL ao invés de SQLite
4. ✅ Configurar HTTPS
5. ✅ Implementar backup automático
6. ✅ Configurar firewall
7. ✅ Atualizar dependências regularmente

### Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
# Banco de Dados
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-secreta-forte"

# Email (opcional)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@financas.com"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📊 Verificação da Instalação

Após instalação, verifique:

- [ ] Sistema abre em http://localhost:3000
- [ ] Login funciona com credenciais padrão
- [ ] Dashboard carrega sem erros
- [ ] Consegue criar transação
- [ ] Consegue criar cartão de crédito
- [ ] Consegue criar empréstimo
- [ ] Calendário exibe eventos

---

## 🆘 Suporte

### Documentação
- **Como Usar:** `docs/sistema/COMO_USAR.md`
- **Configuração:** `docs/sistema/CONFIGURACAO.md`
- **Sistema de Juros:** `docs/sistema/SISTEMA-JUROS-EMPRESTIMOS.md`

### Logs
```bash
# Ver logs do servidor
npm run dev

# Ver logs do Prisma
npx prisma studio
```

### Comunidade
- GitHub Issues: [link]
- Discord: [link]
- Email: suporte@financas.com

---

## 🎉 Próximos Passos

Após instalação bem-sucedida:

1. 📖 Ler `docs/sistema/COMO_USAR.md`
2. ⚙️ Configurar sistema em `docs/sistema/CONFIGURACAO.md`
3. 💰 Entender sistema de juros em `docs/sistema/SISTEMA-JUROS-EMPRESTIMOS.md`
4. 🎨 Personalizar logo e cores
5. 📊 Começar a usar!

---

**Instalação concluída! Bom uso do Finanças UP! 🚀💰**
