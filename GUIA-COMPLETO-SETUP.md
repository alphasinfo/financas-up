# 🎯 GUIA COMPLETO DE SETUP - FINANÇAS UP

## 📊 DIAGNÓSTICO ATUAL DO PROJETO

Execute para ver o estado completo:
```bash
node diagnostico-completo.js
```

---

## ❌ POR QUE O PROJETO LINUX NÃO RODA NO WINDOWS?

### Problema:
```
'next' não é reconhecido como um comando interno
```

### Causa:
O projeto copiado do Linux **NÃO TEM** a pasta `node_modules/` instalada!

### Solução:
```bash
cd C:\Users\foxgt\CascadeProjects\financas-up-linux
npm install
npm run dev
```

**Explicação:** O `node_modules/` nunca deve ser copiado entre sistemas. Sempre deve ser instalado localmente com `npm install`.

---

## 📁 ESTRUTURA DO PROJETO (Verificada)

### ✅ Arquivos de Configuração Encontrados:

```
financas-up/
├── .env                    ← Configuração ATUAL (PostgreSQL/Supabase)
├── .env.example            ← Template de exemplo
├── .env.supabase           ← Backup configuração Supabase
├── bkp/
│   ├── .env.local.bkp      ← Backup SQLite local
│   └── .env.supabase.bkp   ← Backup Supabase
├── scripts/
│   ├── utils/
│   │   ├── alternar-db.js          ← Alterna entre SQLite/PostgreSQL
│   │   ├── usar-local.sh           ← Script Linux para local
│   │   ├── usar-supabase.sh        ← Script Linux para Supabase
│   │   └── verificar-sistema.js    ← Diagnóstico
│   ├── windows/            ← Scripts específicos Windows
│   ├── debian/             ← Scripts específicos Debian
│   └── manjaro/            ← Scripts específicos Manjaro
└── prisma/
    ├── schema.prisma       ← Schema do banco
    ├── dev.db              ← Banco SQLite local
    └── seed.ts             ← Dados de teste
```

---

## 🔧 CONFIGURAÇÃO ATUAL (Detectada)

### Arquivo .env:
- ✅ Existe
- 🗄️ Tipo: **PostgreSQL/Supabase**
- 🔗 URL: `postgresql://***@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- 🌐 NEXTAUTH_URL: `http://localhost:3000`
- 🔐 NEXTAUTH_SECRET: Configurado

### Schema Prisma:
- 🗄️ Configurado para: **PostgreSQL/Supabase**

### Banco de Dados:
- 📊 Usuários: **0** (vazio!)
- ⚠️ Precisa executar seed

---

## 🚀 SETUP PARA DESENVOLVIMENTO LOCAL

### Opção 1: Usar Supabase (Atual)

```bash
# 1. Já está configurado! Apenas popular o banco:
npm run seed

# 2. Iniciar servidor:
npm run dev

# 3. Acessar:
# http://localhost:3000
```

### Opção 2: Usar SQLite Local

```bash
# 1. Copiar configuração local:
copy bkp\.env.local.bkp .env

# 2. Alternar schema para SQLite:
npm run db:local

# 3. Gerar Prisma Client:
npx prisma generate

# 4. Criar banco:
npx prisma db push

# 5. Popular banco:
npm run seed

# 6. Iniciar servidor:
npm run dev
```

---

## 🔄 ALTERNANDO ENTRE BANCOS

### SQLite → Supabase

```bash
# 1. Copiar configuração:
copy .env.supabase .env

# 2. Alternar schema:
npm run db:supabase

# 3. Gerar client:
npx prisma generate

# 4. Sincronizar:
npx prisma db push

# 5. Popular (se necessário):
npm run seed
```

### Supabase → SQLite

```bash
# 1. Copiar configuração:
copy bkp\.env.local.bkp .env

# 2. Alternar schema:
npm run db:local

# 3. Gerar client:
npx prisma generate

# 4. Criar banco:
npx prisma db push

# 5. Popular:
npm run seed
```

---

## 👤 CREDENCIAIS DE TESTE

Após executar `npm run seed`:

- **Email:** admin@financas.com
- **Senha:** admin123

---

## 🐧 PROJETO LINUX NO WINDOWS

### ❌ Erro Comum:
```
'next' não é reconhecido como um comando interno
```

### ✅ Solução:

```bash
# 1. Entrar na pasta:
cd C:\Users\foxgt\CascadeProjects\financas-up-linux

# 2. Instalar dependências:
npm install

# 3. Gerar Prisma Client:
npx prisma generate

# 4. Iniciar:
npm run dev
```

**IMPORTANTE:** Sempre execute `npm install` ao copiar um projeto de outro sistema!

---

## 📝 SCRIPTS DISPONÍVEIS

### Desenvolvimento:
```bash
npm run dev              # Servidor desenvolvimento
npm run build            # Build produção
npm run start            # Servidor produção
```

### Banco de Dados:
```bash
npm run db:local         # Configurar SQLite
npm run db:supabase      # Configurar PostgreSQL
npm run seed             # Popular banco
```

### Diagnóstico:
```bash
node diagnostico-completo.js    # Diagnóstico completo
node verify-project.js          # Verificar código
node setup-local-dev.js         # Verificar setup
```

### Prisma:
```bash
npx prisma studio        # Interface visual
npx prisma db push       # Sincronizar schema
npx prisma generate      # Gerar client
npx prisma migrate dev   # Criar migration
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

Execute este comando para ver tudo:
```bash
node diagnostico-completo.js
```

Ele mostra:
- ✅ Arquivos de configuração
- ✅ Backups disponíveis
- ✅ Scripts disponíveis
- ✅ Estado do banco
- ✅ Usuários cadastrados
- ✅ Recomendações

---

## ⚠️ PROBLEMAS COMUNS

### 1. "Não consigo logar"
**Causa:** Banco sem usuários  
**Solução:** `npm run seed`

### 2. "'next' não é reconhecido"
**Causa:** node_modules não instalado  
**Solução:** `npm install`

### 3. "Prisma Client not generated"
**Causa:** Client não gerado  
**Solução:** `npx prisma generate`

### 4. "Can't reach database"
**Causa:** URL incorreta no .env  
**Solução:** Verificar DATABASE_URL

### 5. "Build falha no Windows mas funciona na Vercel"
**Causa:** Diferenças de ambiente  
**Solução:** Normal! Vercel usa Linux e compila corretamente

---

## 📦 ARQUIVOS IMPORTANTES

### Configuração:
- `.env` - Configuração atual
- `.env.supabase` - Backup Supabase
- `bkp/.env.local.bkp` - Backup SQLite
- `bkp/.env.supabase.bkp` - Backup Supabase

### Scripts:
- `scripts/utils/alternar-db.js` - Alterna banco
- `scripts/utils/verificar-sistema.js` - Diagnóstico
- `diagnostico-completo.js` - Diagnóstico completo

### Documentação:
- `README.md` - Documentação principal
- `SETUP-LOCAL.md` - Setup local
- `CORRECOES-TYPESCRIPT.md` - Correções aplicadas
- `GUIA-COMPLETO-SETUP.md` - Este guia

---

## 🎯 RESUMO RÁPIDO

### Para começar AGORA:

```bash
# 1. Popular banco (se vazio):
npm run seed

# 2. Iniciar:
npm run dev

# 3. Acessar:
# http://localhost:3000

# 4. Login:
# Email: admin@financas.com
# Senha: admin123
```

---

**Desenvolvido com ❤️ por Finanças UP**
