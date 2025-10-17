# 🚀 Como Aplicar Índices no Supabase

**Siga estes passos quando estiver pronto para aplicar os índices no Supabase:**

---

## 📋 Pré-requisitos

- [ ] Ter o Supabase configurado e funcionando
- [ ] Ter a `DATABASE_URL` do Supabase no arquivo `.env`
- [ ] Sistema funcionando localmente

---

## ✅ PASSO A PASSO

### 1. Verifique sua conexão com Supabase

Abra o arquivo `.env` e confirme que tem algo assim:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@[SEU-PROJETO].supabase.co:5432/postgres"
```

### 2. Ajuste o schema.prisma

Abra `prisma/schema.prisma` e verifique que está assim:

```prisma
datasource db {
  provider = "postgresql"  # ← Deve ser "postgresql"
  url      = env("DATABASE_URL")
}
```

**Se estiver "sqlite", mude para "postgresql"**

### 3. Aplique os índices

Execute este comando:

```bash
npx prisma db push
```

**O que vai acontecer:**
- Prisma vai se conectar ao Supabase
- Vai adicionar os 19 índices no banco
- Vai mostrar mensagem de sucesso
- **NÃO vai apagar dados!** (só adiciona índices)

### 4. Gere o Prisma Client

```bash
npx prisma generate
```

### 5. Reinicie o servidor

```bash
npm run dev
```

---

## 🎯 Resultado Esperado

Depois de aplicar, você deve ver:

```
✔ Generated Prisma Client
Database schema is up to date!
```

E o sistema deve estar **10-50x mais rápido!** ⚡

---

## ⚠️ Se Der Erro

### Erro: "Can't reach database server"

**Solução:**
1. Verifique se o `DATABASE_URL` está correto
2. Teste a conexão no painel do Supabase
3. Verifique se não tem firewall bloqueando

### Erro: "Invalid DATABASE_URL"

**Solução:**
1. Copie novamente a URL do painel do Supabase
2. Cole no `.env` sem espaços extras
3. Reinicie o terminal

### Erro: "Schema validation failed"

**Solução:**
1. Verifique se `provider = "postgresql"` no schema.prisma
2. Execute: `npx prisma format`
3. Tente novamente

---

## 📦 Backup de Segurança

**Antes de aplicar, faça backup:**

```bash
# Backup do .env
cp .env bkp/.env.backup.$(date +%Y%m%d_%H%M%S)

# Backup do schema
cp prisma/schema.prisma bkp/schema.backup.$(date +%Y%m%d_%H%M%S)
```

---

## 🔄 Voltar para Local (se precisar)

Se algo der errado e quiser voltar para banco local:

```bash
./scripts/manjaro/usar-local.sh
# ou
./scripts/debian/usar-local.sh
```

---

## ✅ Confirmar que Funcionou

Depois de aplicar:

1. **Abra o calendário:** http://localhost:3000/dashboard/calendario
2. **Deve carregar em < 1 segundo** (antes: 5-15s)
3. **Troque de mês → instantâneo**
4. **Dashboard deve estar muito mais rápido**

---

## 📊 Índices Que Serão Criados

**Total: 19 índices**

- Transacao (8 índices)
  - usuarioId, dataCompetencia, status, etc.
  
- Fatura (4 índices)
  - cartaoId, mesRef/anoRef, dataVencimento
  
- Emprestimo (3 índices)
  - usuarioId, status
  
- ParcelaEmprestimo (3 índices)
  - emprestimoId, status, dataVencimento
  
- Orcamento (2 índices)
  - usuarioId, mesRef/anoRef

---

## 💡 Perguntas Frequentes

### Os índices vão apagar meus dados?
**Não!** Índices apenas melhoram a performance. Seus dados ficam intactos.

### Quanto tempo demora?
**30-60 segundos** dependendo da quantidade de dados.

### Preciso fazer isso agora?
**Não!** Você pode continuar usando sem índices. Mas a performance será muito melhor com eles.

### Posso reverter depois?
**Sim!** Índices podem ser removidos a qualquer momento (mas não recomendado).

---

**Dúvidas?** Veja: `OTIMIZACOES-APLICADAS.md`
